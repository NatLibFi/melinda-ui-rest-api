//*****************************************************************************
//
// New "Reactless" Muuntaja Sketch
//
//*****************************************************************************

import {startProcess, stopProcess} from '/common/ui-utils.js';
import {showTab, resetForms, reload} from '/common/ui-utils.js';
import {createMenuBreak, createMenuItem, createMenuSelection, showNotification, showServerNotifications} from '../common/ui-utils.js';

import {Account, doLogin, logout} from '/common/auth.js';
import {showRecord, editField} from '/common/marc-record-ui.js';
import {modifyRecord} from '../common/rest.js';

//-----------------------------------------------------------------------------
// on page load:
//-----------------------------------------------------------------------------

window.initialize = function () {
  console.log('Initializing');

  showServerNotifications('edit', doLogin(authSuccess));

  function authSuccess(user) {
    const accountMenu = document.getElementById('accountMenu');
    accountMenu.classList.add('show');
    const username = document.querySelector('#accountMenu #username');
    username.innerHTML = Account.get().Name;
    showTab('muuntaja');
    doFetch();
  }
};

//-----------------------------------------------------------------------------

window.onAccount = function (e) {
  console.log('Account:', e);
  logout();
};

window.onEdit = function (e) {
  console.log('Edit:', e);
  editmode = !editmode;
  if (editmode) {
    e.target.style.background = 'var(--color-teal-60)';
  } else {
    e.target.style.background = '';
  }
  showTransformed();
  return eventHandled(e);
};

window.onNewField = function(e) {
  editField({
    tag: '', ind1: '', ind2: '',
    subfields: []
  });
  return eventHandled(e);
};

//-----------------------------------------------------------------------------
// Field decorating
//-----------------------------------------------------------------------------

let transformed = {
  source: {},
  include: [],
  exclude: {},
  replace: {}
};

const lookup = {
  original: {},
  included: {}
};

var editmode = false;

function getContent(field) {
  return transformed.replace[field.id] ?? field;
}

function getOriginal(field) {
  return lookup.original[field.id] ?? field;
}

function decorateField(div, field) {
  if (transformed.exclude[field.id]) {
    div.classList.add('row-excluded');
  }
  if (transformed.replace[field.id]) {
    div.classList.add('row-replaced');
    return;
  }
  if (lookup.included[field.id]) {
    div.classList.add('row-included');
  }
}

function onFieldClick(event, field) {
  //console.log("Click", field)
  if (editmode) {
    editField(getContent(field), getOriginal(field));
  } else {
    toggleField(field);
  }
  return eventHandled(event);

  function toggleField(field) {
    const {id} = field;

    console.log('Toggle:', id);

    if (lookup.included[id]) {
      transformed.include.filter(f => f.id != id);
    } else if (!transformed.exclude[id]) {
      transformed.exclude[id] = true;
    } else {
      delete transformed.exclude[id];
    }

    doFetch();
  }
}

window.editSaveField = function(field) {
  console.log('Saving field:', field);

  if (field.id) {
    transformed.replace[field.id] = field;
  } else {
    transformed.include.push(field);
  }
  doFetch();
};

window.editUseOriginal = function(field) {
  delete transformed.replace[field.id];
  doFetch();
};

const decorator = {
  getContent,
  getOriginal,
  decorateField,

  onClick: onFieldClick
};

//-----------------------------------------------------------------------------
// Do transform
//-----------------------------------------------------------------------------

window.doFetch = function (event = undefined) {
  console.log('Fetching...');
  if (event) {
    event.preventDefault();
  }

  const sourceID = document.querySelector(`#muuntaja .record-merge-panel #source #ID`).value;
  //const baseID = document.querySelector(`#muuntaja .record-merge-panel #record2 #ID`).value;

  if (!transformed.source || sourceID != transformed.source.ID) {
    transformed.source = {ID: sourceID};
  }

  //console.log('Source ID:', sourceID);
  //console.log('Base ID:', baseID);
  console.log('Fetching:', transformed);

  startProcess();

  modifyRecord(transformed)
    .then(response => {
      stopProcess(); return response;
    })
    .then(response => response.json())
    .then(records => showTransformed(records));
};

function showTransformed(records) {
  console.log('Fetched:', records);

  if (records) {
    transformed = records;
  }

  lookup.original = getLookup(getFields(transformed.source));
  lookup.included = getLookup(transformed.include);

  showRecord(transformed.source, 'source', decorator);
  showRecord(transformed.result, 'result', decorator);

  function getFields(record) {
    return record?.fields ?? [];
  }

  function getLookup(fields) {
    return fields.reduce((a, field) => ({...a, [field.id]: field}), {});
  }
}

