/* ---------------------------------------------------------------------------- */
/* Shared functionalities of MUUNTAJA and MERGE app                             */
/* ---------------------------------------------------------------------------- */
//-----------------------------------------------------------------------------
// info needed for muuntaja merge REST call:
// - Base record
// - Transform options
// - Source record
// - Field selections
// - User edits
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import { logout } from '/common/auth.js';
import { editField, showRecord } from '/common/marc-record-ui.js';
import { storeTransformedRequest, transformRequest } from '/common/rest.js';
import {
  resetForms, showNotification,
  startProcess, stopProcess
} from '/common/ui-utils.js';
import * as dataModule from '/merge/common/dataHandler.js';
import * as urlModule from '/merge/common/urlHandler.js';
import * as dlgModule from '/merge/common/dlgHandler.js';
import * as jsonModule from '/merge/common/jsonHandler.js';

//-----------------------------------------------------------------------------
// Exported
//-----------------------------------------------------------------------------

//*******************
// By hand
//*******************
export {
  dataModule, initCommonModule, urlModule
};

/**
 * Clears any variables shared within imported script module,
 * gets called on importing scripts init
 *
 * Default to 'muuntaja' client baviour
 * @param {object|undefined} initData object holding some configuration data for common
 * @param {boolean} initData.canUseProfileType - can user select profile and type for transformation
 * @param {object} initData.transformedOptions - options to override transformed objects options on default
 * @param {string} initData.client - what named client we are using, available locally on dataModule.getClientName(), used to find from html correct div and what to set to url, use lowercase
 */
function initCommonModule(data = {}) {
  dataModule.init(data);
  urlModule.init();
  dlgModule.init();
  jsonModule.init();
}

//*******************
// through window
//*******************
window.onNew = function (event) {
  console.log('New:', event);
  resetForms(document.getElementById(dataModule.getClientName()));
  return eventHandled(event);
}
window.onEdit = function (event) {
  console.log('Edit:', event);
  dataModule.flipEditMode();
  if (dataModule.getEditMode()) {
    event.target.classList.add('edit-mode');
  } else {
    event.target.classList.remove('edit-mode');
  }
  styleBasedOnEditState();
  showTransformed(null);
  return eventHandled(event);

  function styleBasedOnEditState() {
    const originalStyle = getComputedStyle(document.querySelector('.record-merge-panel'));
    const borderStyleActive = "solid";
    const borderColorActive = originalStyle.getPropertyValue('--color-melinda-green-custom');

    //use .record-merge-panel #source/#base/#result #some-sub-id/.some-sub-class
    const resultPanel = document.querySelector('.record-merge-panel #result ');

    if (dataModule.getEditMode()) {
      resultPanel.style.borderStyle = borderStyleActive;
      resultPanel.style.borderColor = borderColorActive;
      resultPanel.style.borderWidth = "2px";
    }
    else {
      resultPanel.style.borderStyle = "initial";
    }
  }
}
window.onNewField = function (event) {
  editField({
    tag: '', ind1: '', ind2: '',
    subfields: []
  });
  return eventHandled(event);
}
window.onNewInstance = function (event) {

  const sourceInput = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #source #ID`);
  sourceInput.value = '';
  sourceInput.dispatchEvent(new Event('input'));

  //set content
  doTransform();
}
window.onSearch = function (event) {
  console.log('Search:', event);
  //const dialog = document.getElementById('searchDlg');
  //console.log('Dialog:', dialog);
  //dialog.show();
}
window.onRecordSwap = function (event) {

  const sourceInput = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #source #ID`);
  const baseInput = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #base #ID`);

  console.log('Swap:ing between source and base');

  //swap id:s
  const originalSourceId = sourceInput.value;
  const originalBaseId = baseInput.value;

  sourceInput.value = originalBaseId;
  baseInput.value = originalSourceId;

  //trigger input event listener to update required values (ie. url parameters)
  sourceInput.dispatchEvent(new Event('input'));
  baseInput.dispatchEvent(new Event('input'));

  //swap records around
  if (dataModule.getTransformed()) {
    const trans = dataModule.getTransformed();
    const sourceData = trans.source;
    const baseData = trans.base;

    dataModule.updateTransformed({
      source: baseData,
      base: sourceData
    });

    doTransform();
  }

  return eventHandled(event);
}
window.onSettings = function (event) {
  console.log('Settings:', event);
  return eventHandled(event);
}
window.onAccount = function (event) {
  console.log('Account:', event);
  logout();
}
window.copyLink = function (event) {
  eventHandled(event);

  const type = dataModule.getUseProfileType() ? document.querySelector('#type-options [name=\'type\']').value : dataModule.getTransformed()?.options?.type;
  const profile = dataModule.getUseProfileType() ? document.querySelector('#profile-options [name=\'profile\']').value : dataModule.getTransformed()?.options?.profile;
  let leadingChar = '';

  if (window.location.href.includes('?')) {
    if (window.location.search !== '') {
      leadingChar = '&';
    }
  } else {
    leadingChar = '?';
  }

  navigator.clipboard.writeText(`${window.location}${leadingChar}type=${type}&profile=${profile}`);

  showNotification({ componentStyle: 'banner', style: 'success', text: 'Linkki kopioitu!' });
}
window.onClearEdits = function (event) {
  dataModule.updateTransformed({
    insert: [],
    exclude: {},
    replace: {}
  });

  doTransform()
  return eventHandled(event);
}
window.onSave = function (event) {
  //console.log("Save:", event)

  // Do transform

  startProcess();

  console.log("Storing:", dataModule.getTransformed())

  storeTransformedRequest(dataModule.getTransformed())
    .then(response => response.json())
    .then(records => {
      stopProcess();
      console.log('Transformed:', records);
      showTransformed(records);
    });

  return eventHandled(event);
}
window.doTransform = function (event = undefined) {
  console.log('Transforming');
  if (event) {
    event.preventDefault();
  }

  //console.log('Source ID:', sourceID);
  //console.log('Base ID:', baseID);

  const sourceID = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #source #ID`).value;
  const baseIDString = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #base #ID`).value;

  const baseID = baseIDString ? baseIDString : undefined

  //exception, if source and base ids are the same inform user, ignore empty searches

  if (sourceID && baseID && sourceID === baseID) {
    console.log('Source and base ID:s match. This is not permitted');
    alert('Lähde ja Pohja tietueet eivät voi olla samat');
    return;
  }

  // If source is changed, clear the corresponding records and all the edits
  if (sourceID != dataModule.getTransformed()?.source?.ID) {
    console.log("Source ID mismatch:", sourceID, "!==", dataModule.getTransformed()?.source?.ID)
    const tmpTransformed = dataModule.getTransformed();
    dataModule.resetTransformed();
    dataModule.updateTransformed({
      options: tmpTransformed.options,
      base: tmpTransformed.base,
      source: { ID: sourceID }
    });
  }

  if (!dataModule.getTransformed().base || baseID !== dataModule.getTransformed().base.ID) {
    console.log("Base ID mismatch")
    dataModule.updateTransformed({
      base: { ID: baseID }
    });
    dataModule.deleteFromTransformed('stored');
  }

  // Do transform
  console.log('Transforming:', dataModule.getTransformed());

  startProcess();

  transformRequest(dataModule.getTransformed())
    .then(response => response.json())
    .then(records => {
      stopProcess();
      console.log('Transformed:', records);
      showTransformed(records);
    });
}
window.editSaveField = function (field) {
  //-----------------------------------------------------------------------------
  // Saving edited field: if field is in source or base, add a replace rule.
  // If it is in insert array, replace it from there. If it has no ID, add
  // it to insert array.
  //-----------------------------------------------------------------------------

  console.log('Saving field:', field);

  const { id } = field
  const insertValue = dataModule.getTransformed().insert;

  if (!id) {
    dataModule.updateTransformed({
      insert: [
        ...insertValue,
        field
      ]
    });
  } else {
    const isInserted = dataModule.getTransformed().insert.filter(f => f.id === id).length > 0
    if (isInserted) {
      dataModule.updateTransformed({
        insert: [
          ...insertValue.filter(f => f.id !== id),
          field
        ]
      });
    } else {
      const replaceValue = dataModule.getTransformed().replace;
      replaceValue[field.id] = field;
      dataModule.updateTransformed({
        replace: replaceValue
      });
    }
  }
  doTransform();
}
window.editUseOriginal = function (field) {
  const deletePath = `replace.${field.id}`;
  dataModule.deleteFromTransformed(deletePath);
  doTransform();
}

//-----------------------------------------------------------------------------
// Private
//-----------------------------------------------------------------------------

/**
 * Main function for showing transformed data on ui
 * TODO: add more description
 * - resets and updates transformed with update data
 * - get fields and handle id data bundling
 * - show record for source, base and result
 * - udpates different button states based on current state
 *
 * @param {object} [update=undefined] - update object for updating transformed object, defaults to undefined
 */
function showTransformed(update = undefined) {
  //TODO: should the update handled elsewhere separetely and not updated here ?
  //updateTransformed(update);
  if (update) {
    dataModule.resetTransformed();
    dataModule.updateTransformed({
      ...update
    });
  }

  const { source, base, insert, stored, result } = dataModule.getTransformed();

  const isStored = !!stored

  // Get field source for decorator
  const sourceFields = getFields(source);
  const baseFields = getFields(base);
  const addedFields = insert;
  const resultFields = getFields(result);
  const storedFields = getFields(stored);

  const resultIDs = resultFields.filter(f => !!f.id).map(f => f.id);
  const includedSourceIDs = sourceFields.map(f => f.id).filter(id => resultIDs.includes(id));
  const includedBaseIDs = baseFields.map(f => f.id).filter(id => resultIDs.includes(id));
  const includedAddedIDs = addedFields.map(f => f.id).filter(id => resultIDs.includes(id));

  const from = {
    ...includedSourceIDs.reduce((a, id) => ({ ...a, [id]: dataModule.getKeys().source }), {}),
    ...includedBaseIDs.reduce((a, id) => ({ ...a, [id]: dataModule.getKeys().base }), {}),
    ...includedAddedIDs.reduce((a, id) => ({ ...a, [id]: dataModule.getKeys().insert }), {})
  };

  const original = getLookup(sourceFields.concat(baseFields).concat(storedFields));

  //console.log(dataModule.getTransformed().from)

  // Show records
  showRecord(source, dataModule.getKeys().source, {
    onClick: onFieldToggleClick,
    from,
    exclude: dataModule.getTransformed().exclude
  }, dataModule.getClientName());
  showRecord(base, dataModule.getKeys().base, {
    onClick: onFieldToggleClick,
    from,
    exclude: dataModule.getTransformed().exclude
  }, dataModule.getClientName());
  showRecord(result, dataModule.getKeys().result, {
    onClick: (dataModule.getEditMode() || isStored) ? onEditClick : onFieldToggleClick,
    onDelete: onFieldToggleClick,
    from,
    original,
    exclude: dataModule.getTransformed().exclude,
    replace: dataModule.getTransformed().replace,
    insert: dataModule.getTransformed().insert
  }, dataModule.getClientName());

  // Update UI states according to result
  urlModule.updateUrlParameters(dataModule.getTransformed());
  updateRecordSwapButtonState();
  updateSaveButtonState(dataModule.getTransformed());
  updateEditButtonState(dataModule.getTransformed())
  updateResultID(dataModule.getTransformed());

  function getFields(record) {
    return record?.fields ?? [];
  }
  function getLookup(fields) {
    return fields.reduce((a, field) => ({ ...a, [field.id]: field }), {});
  }
  function updateResultID(transformed) {
    const { result } = transformed
    const resultID = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #result #ID`)

    //console.log("Stored:", stored)

    if (result?.ID) {
      resultID.textContent = "TIETUE " + result?.ID
    } else {
      resultID.textContent = "TULOSTIETUE"
    }
  }
  function updateSaveButtonState(transformed) {
    const { result } = transformed

    const savebtn = document.getElementById("save-button")
    if (result.ID || (result?.leader)) {
      savebtn.disabled = false
    } else {
      savebtn.disabled = true
    }
  }
  function updateEditButtonState(transformed) {
    const { stored } = transformed
    const editbtn = document.getElementById("edit-button")

    if (stored) {
      editbtn.disabled = true
    } else {
      editbtn.disabled = false
    }
  }
  function updateRecordSwapButtonState() {
    const sourceID = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #source #ID`).value;
    const baseID = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #base #ID`).value;

    document.getElementById('swap-button').disabled = !sourceID || !baseID;
  };
}

/**
 * Clicking the records field, toggles it on/off
 *
 * @param {Event} event - on clicking the field data
 * @param {object} field - field data
 */
function onFieldToggleClick(event, field) {
  const { id } = field;
  console.log(`Toggle Click on ${id}`);

  if (id) {
    const insertData = dataModule.getTransformed().insert;
    const isInserted = insertData.filter(f => f.id === id).length > 0

    if (isInserted) {
      dataModule.updateTransformed({
        insert: [
          ...insertData.filter(f => f.id !== id),
        ]
      });
    } else if (!dataModule.getTransformed().exclude[id]) {
      const exclude = dataModule.getTransformed().exclude;
      exclude[id] = true;
      dataModule.updateTransformed({
        exclude: exclude
      });
    } else {
      const deletePath = `exclude.${id}`;
      dataModule.deleteFromTransformed(deletePath);
    }

    doTransform();
  }
}
// Field view decorator
/**
 * Clicking on (edit enabled) the record field.
 *
 * @param {Event} event - on clicking the field data
 * @param {object} field - field data
 * @param {object} original - result of reduction in showTransformed getLookup. Essentially object with fields array values as sub objects with each objects id field value set objects field key
 * @returns {boolean} True if the event was handled, false otherwise.
 */
function onEditClick(event, field, original) {
  const { id } = field;
  console.log(`Edit Click on ${id}`);

  //returns sub element of the field clicked, if no specific subelement it returns just row row-fromBase
  //span uses as class classname/id
  var subElement = null;
  try {
    subElement = {};
    subElement.class = event.originalTarget.attributes.class.nodeValue;
    subElement.index = parseInt(event.originalTarget.attributes.index.nodeValue);
  } catch (error) {
    console.log(`Getting field sub element encountered error: ${error}.`);
    console.log('Or maybe user clicked on some parent element without required attributes. Skipping preactivation for a spesific value.');
    subElement = null;
  }
  //make sure only certain values can be auto edit focus requested
  //if not correct later expects null and does nothing
  if (subElement && !isSubElementAcceptable(subElement.class)) {
    console.log(`Fields sub element ${subElement.class} is not acceptable for pre activation`);
    subElement = null;
  }

  editField(field, original, subElement);

  return eventHandled(event);

  function isSubElementAcceptable(elementRequested) {
    switch (elementRequested) {
      case 'tag':
      case 'ind1':
      case 'ind2':
      case 'code':
      case 'value':
        return true;
      default:
        return false;
    }
  }
}

