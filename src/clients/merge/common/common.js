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
import { editField } from '/common/marc-record-ui.js';
import { storeTransformedRequest } from '/common/rest.js';
import {
  resetForms, showNotification,
  startProcess, stopProcess
} from '/common/ui-utils.js';
import * as dataModule from '/merge/common/dataHandler.js';
import * as dlgModule from '/merge/common/dlgHandler.js';
import * as jsonModule from '/merge/common/jsonHandler.js';
import * as transformModule from '/merge/common/transformationHandler.js';
import * as urlModule from '/merge/common/urlHandler.js';

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
  console.log(`Common module initializing for ${data?.client}`);
  dataModule.init(data);
  urlModule.init();
  dlgModule.init();
  jsonModule.init();
  transformModule.init();
  console.log('All modules initialized');
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
  transformModule.showTransformed(null);
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
      transformModule.showTransformed(records);
    });

  return eventHandled(event);
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


