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
import {
  resetForms, showNotification,
  startProcess, stopProcess
} from '/common/ui-utils.js';

import { logout } from '/common/auth.js';
import { editField, showRecord } from '/common/marc-record-ui.js';
import { storeTransformedRequest, transformRequest } from '/common/rest.js';

//-----------------------------------------------------------------------------
// Global variables
//-----------------------------------------------------------------------------
let transformed, useProfileType, clientName;
window.editMode = false;
const keys = {
  source: 'source',
  base: 'base',
  insert: 'insert',
  result: 'result'
};

//-----------------------------------------------------------------------------
// Exported
//-----------------------------------------------------------------------------

//*******************
// By hand
//*******************
export {
  deleteFromTransformed, getTransformed, initModule, parseUrlParameters, updateTransformed, resetTransformed
};

/**
 * Clears any variables shared within imported script module,
 * gets called on importing scripts init
 *
 * Default to 'muuntaja' client baviour
 * @param {object|undefined} initData object holding some configuration data for common
 * @param {boolean} initData.canUseProfileType - can user select profile and type for transformation
 * @param {object} initData.transformedOptions - options to override transformed objects options on default
 * @param {string} initData.client - what named client we are using, available locally on clientName, used to find from html correct div and what to set to url, use lowercase
 */
function initModule(initData = {}) {
  const { canUseProfileType = true, transformedOptions = undefined, client = 'muuntaja' } = initData;

  transformed = Object.create(initTransformed());
  editMode = false;
  useProfileType = canUseProfileType;
  clientName = client;

  //override options
  if (transformedOptions) {
    transformed.options = transformedOptions;
  }
}
/**
 * Parse data from url parameters
 * get data from url parameters (has defaults) and sets id to source and bas
 * IF profile and type are enabled set updates type and profile dropdown selector and update transformed options from them
 */
function parseUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const sourceId = urlParams.get('sourceId') || '';
  const baseId = urlParams.get('baseId') || '';


  document.querySelector('.record-merge-panel #source #ID').defaultValue = sourceId;
  document.querySelector('.record-merge-panel #base #ID').defaultValue = baseId;

  if (useProfileType) {
    const type = urlParams.get('type') || 'p2e';
    const profile = urlParams.get('profile') || 'DEFAULT';

    document.querySelector('#type-options [name=\'type\']').value = type;
    document.querySelector('#profile-options [name=\'profile\']').value = profile;

    transformed.options.type = type;
    transformed.options.profile = profile;
  }
}
//common transformed edit functions
function getTransformed() { return transformed; }
function updateTransformed({ updateData }) { transformed.update(updateData); }
function deleteFromTransformed(propertyPathInString) { transformed.deleteProperty(propertyPathInString); }
function resetTransformed() {
  transformed = Object.create(initTransformed());
}

//*******************
// through window
//*******************
window.onNew = function (event) {
  console.log('New:', event);
  resetForms(document.getElementById(clientName));
  return eventHandled(event);
}
window.onEdit = function (event) {
  console.log('Edit:', event);
  editMode = !editMode;
  if (editMode) {
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

    if (editMode) {
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

  const sourceInput = document.querySelector(`#${clientName} .record-merge-panel #source #ID`);
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

  const sourceInput = document.querySelector(`#${clientName} .record-merge-panel #source #ID`);
  const baseInput = document.querySelector(`#${clientName} .record-merge-panel #base #ID`);

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
  if (transformed) {
    const sourceData = transformed.source;
    const baseData = transformed.base;

    transformed.source = baseData;
    transformed.base = sourceData;

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

  const type = useProfileType ? document.querySelector('#type-options [name=\'type\']').value : transformed?.options?.type;
  const profile = useProfileType ? document.querySelector('#profile-options [name=\'profile\']').value : transformed?.options?.profile;
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
  transformed.insert = []
  transformed.exclude = {}
  transformed.replace = {}

  doTransform()
  return eventHandled(event);
}
window.onSave = function (event) {
  //console.log("Save:", event)

  // Do transform

  startProcess();

  console.log("Storing:", transformed)

  storeTransformedRequest(transformed)
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

  const sourceID = document.querySelector(`#${clientName} .record-merge-panel #source #ID`).value;
  const baseIDString = document.querySelector(`#${clientName} .record-merge-panel #base #ID`).value;

  const baseID = baseIDString ? baseIDString : undefined

  //exception, if source and base ids are the same inform user, ignore empty searches

  if (sourceID && baseID && sourceID === baseID) {
    console.log('Source and base ID:s match. This is not permitted');
    alert('Lähde ja Pohja tietueet eivät voi olla samat');
    return;
  }

  // If source is changed, clear the corresponding records and all the edits
  if (sourceID != transformed?.source?.ID) {
    console.log("Source ID mismatch:", sourceID, "!==", transformed?.source?.ID)
    transformed = {
      options: transformed.options,
      base: transformed.base,
      source: { ID: sourceID }
    }
  }

  if (!transformed.base || baseID !== transformed.base.ID) {
    console.log("Base ID mismatch")
    transformed.base = { ID: baseID };
    delete transformed.stored;
  }

  // Do transform

  console.log('Transforming:', transformed);

  startProcess();

  transformRequest(transformed)
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

  if (!id) {
    transformed.insert = [
      ...transformed.insert,
      field
    ]
  } else {
    const isInserted = transformed.insert.filter(f => f.id === id).length > 0
    if (isInserted) {
      transformed.insert = [
        ...transformed.insert.filter(f => f.id !== id),
        field
      ]
    } else {
      transformed.replace[field.id] = field;
    }
  }
  doTransform();
}
window.editUseOriginal = function (field) {
  delete transformed.replace[field.id];
  doTransform();
}
window.notFoundDlgClose = function (event) {
  const dlg = document.querySelector('#notFoundDlg');
  dlg.style.display = 'none';
  return eventHandled(event);
}
window.jsonDlgOpen = function (event) {
  const dlg = document.querySelector('#jsonDlg');
  dlg.style.display = 'flex';
  const content = document.querySelector('#jsonDlg #jsonContent');
  content.innerHTML = '';
  content.appendChild(createJsonInput({ id: 'recordAsJson', className: 'recordAsJson', content: JSON.stringify(transformed, null, 1) }));
}
window.jsonDlgClose = function (event) {
  const dlg = document.querySelector('#jsonDlg');
  dlg.style.display = 'none';
  return eventHandled(event);
}
window.selectJson = function (event) {
  const record = document.querySelector('#recordAsJson');
  if (document.body.createTextRange) {
    var range = document.body.createTextRange();
    range.moveToElementText(record);
    range.select();
  } else if (window.getSelection) {
    const selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(record);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
window.saveJson = function sharedSaveJson(event) {
  const record = document.querySelector('#recordAsJson');
  transformed = JSON.parse(record.textContent);
  doTransform();
  if (useProfileType) {
    document.querySelector('#type-options [name=\'type\']').value = transformed.options.type;
    document.querySelector('#profile-options [name=\'profile\']').value = transformed.options.profile;
  }
  jsonDlgClose(event);
}

//-----------------------------------------------------------------------------
// Private
//-----------------------------------------------------------------------------

/**
 * Get basic transformed object with
 *
 * @returns {object} unmodified transformed object
 */
function initTransformed() {
  return {
    options: {},
    source: null,
    base: null,
    exclude: {},
    replace: {},
    insert: [],

    //update one or all fields with object containing field or fields to update
    update(newData) {
      Object.assign(this, newData);
    },
    deleteProperty(propertyPathInString) {
      //simple object field
      if (propertyPathInString in this) {
        delete this[propertyPathInString];
        return;
      }

      //nested property
      const propertiesInPath = propertyPathInString.split('.');
      let currentObj = this;
      for (const property of propertiesInPath.slice(0, -1)) {
        if (!(property in currentObj)) {
          //console.log(`Nested property '${propertyPathInString}' does not exist.`);
          return;
        }
        currentObj = currentObj[property];
      }
      delete currentObj[propertiesInPath[propertiesInPath.length - 1]];
    }
  };
}
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
    transformed = {
      source: null,
      base: null,
      insert: [],
      exclude: {},
      replace: {},
      result: null,
      stored: null,
      ...update
    }
  }

  const { source, base, insert, stored, result } = transformed;

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
    ...includedSourceIDs.reduce((a, id) => ({ ...a, [id]: keys.source }), {}),
    ...includedBaseIDs.reduce((a, id) => ({ ...a, [id]: keys.base }), {}),
    ...includedAddedIDs.reduce((a, id) => ({ ...a, [id]: keys.insert }), {})
  };

  const original = getLookup(sourceFields.concat(baseFields).concat(storedFields));

  //console.log(transformed.from)

  // Show records
  showRecord(source, keys.source, {
    onClick: onFieldToggleClick,
    from,
    exclude: transformed.exclude
  }, clientName);
  showRecord(base, keys.base, {
    onClick: onFieldToggleClick,
    from,
    exclude: transformed.exclude
  }, clientName);
  showRecord(result, keys.result, {
    onClick: (editMode || isStored) ? onEditClick : onFieldToggleClick,
    onDelete: onFieldToggleClick,
    from,
    original,
    exclude: transformed.exclude,
    replace: transformed.replace,
    insert: transformed.insert
  }, clientName);

  // Update UI states according to result
  updateUrlParameters(transformed);
  updateRecordSwapButtonState();
  updateSaveButtonState(transformed);
  updateEditButtonState(transformed)
  updateResultID(transformed);

  function getFields(record) {
    return record?.fields ?? [];
  }
  function getLookup(fields) {
    return fields.reduce((a, field) => ({ ...a, [field.id]: field }), {});
  }
  function updateResultID(transformed) {
    const { result } = transformed
    const resultID = document.querySelector(`#${clientName} .record-merge-panel #result #ID`)

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
    const sourceID = document.querySelector(`#${clientName} .record-merge-panel #source #ID`).value;
    const baseID = document.querySelector(`#${clientName} .record-merge-panel #base #ID`).value;

    document.getElementById('swap-button').disabled = !sourceID || !baseID;
  };
}
/**
 * Set in ui dialog visible and show record type
 *
 * @param {object} object - data set trough object
 * @param {string} object.recordType - record type that was not found
 */
function notFoundDlgOpen({recordType}) {
  const dlg = document.querySelector('#notFoundDlg');
  dlg.style.display = 'flex';
  const prefix = document.querySelector('#notFoundDlg #recordType');
  prefix.innerHTML = recordType;
}
/**
 * Creates a preformatted text element, sets some data to its attribute and classList
 *
 * @param {object} object - data set trough object
 * @param {object} object.id - record id
 * @param {object} object.className - any class you want to add to elements classList
 * @param {string} object.content - json as text
 * @param {boolean} [object.editable=true] - should the text be editable
 * @returns {HTMLElement} created input '<pre>' element (preformatted text element)
 */
function createJsonInput({ id, className, content, editable = true }) {
  const input = document.createElement('pre');
  input.setAttribute('id', id);
  input.classList.add(className);
  if (editable) {
    input.classList.add('editable');
  }
  input.textContent = content;
  input.contentEditable = editable;
  return input;
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
    const isInserted = transformed.insert.filter(f => f.id === id).length > 0

    if (isInserted) {
      transformed.insert = [
        ...transformed.insert.filter(f => f.id !== id),
      ]
    } else if (!transformed.exclude[id]) {
      transformed.exclude[id] = true;
    } else {
      delete transformed.exclude[id];
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
/**
 * Updates pages url search params.
 * empty seach defaults to client name provided
 * useProfileType variable configures if profile and type are available in url params
 *
 * @param {object} transformed transformed dataobject
 */
function updateUrlParameters(transformed) {
  const urlParams = new URLSearchParams(window.location.search);

  const { options, source, base } = transformed

  if (useProfileType) {
    setUrlParam("type", options?.type)
    setUrlParam("profile", options?.profile)
  }

  setUrlParam("baseId", base?.ID)
  setUrlParam("sourceId", source?.ID)

  window.history.replaceState({}, '', decodeURIComponent(`${window.location.pathname}?${urlParams}`));

  if (window.location.search === '') {
    window.history.replaceState({}, '', `/${clientName}/`);
  }

  function setUrlParam(id, value) {
    if (value) {
      urlParams.set(id, value)
    } else {
      urlParams.delete(id)
    }
  }
}
