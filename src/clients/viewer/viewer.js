//*****************************************************************************
//
// New "Reactless" Viewer Sketch
//
//*****************************************************************************

import {setNavBar, startProcess, stopProcess} from "/common/ui-utils.js";
import {showTab, resetForms, reload} from "/common/ui-utils.js";
import {createMenuBreak, createMenuItem, createMenuSelection} from "../common/ui-utils.js";

import {Account, doLogin, logout} from "/common/auth.js"
import {transformRequest} from "/common/rest.js";
import {showRecord} from "/common/marc-record-ui.js";
import {getMergeLog, protectLog, removeLog} from "../common/rest.js";

var viewing = {
  record1: {},
  record2: {},
  record3: {}
}

//-----------------------------------------------------------------------------
// on page load:
//-----------------------------------------------------------------------------

window.initialize = function () {
  console.log('Initializing');

  setNavBar(document.querySelector('#navbar'), "Viewer")
  const select = document.querySelector(`#viewer #sequence`);
  select.innerHTML = '';
  select.setAttribute('disabled', false)

  doLogin(authSuccess);

  function authSuccess(user) {
    const username = document.querySelector("#account-menu #username")
    username.innerHTML = Account.get()["Name"];
    showTab('viewer');
    parseUrlParameters();
  }

  function parseUrlParameters() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id') || '';
    const sequence = urlParams.get('sequence') || '';

    document.querySelector(`#viewer #id`).defaultValue = id;
    const select = document.querySelector(`#viewer #sequence`);
    const seqOption = createOption(sequence, sequence);
    select.add(seqOption);
    select.value = sequence;

    window.history.pushState('', 'viewer', `/viewer/`);
  }
}

//-----------------------------------------------------------------------------

window.onAccount = function (e) {
  console.log('Account:', e);
  logout();
}

//-----------------------------------------------------------------------------
// Do button actions
//-----------------------------------------------------------------------------

var transformed = {
  record1: {},
  record2: {},
  record3: {}
}

window.doSearchPress = function (event = undefined) {
  const id = document.querySelector(`#viewer #id`).value || '';
  const sequence = document.querySelector('#viewer #sequence').value || 0
  const logType = document.querySelector(`#viewer #logType`).value || 'MERGE_LOG';

  doFetch(event, id, sequence, logType);
}

window.doFetch = function (event = undefined, id = '', sequence = 0, logType = 'MERGE_LOG') {
  eventHandled(event)
  startProcess();
  const select = document.querySelector(`#viewer #sequence`);
  select.innerHTML = '';
  select.setAttribute('disabled', false)
  console.log('Fetching...');

  if (id === '') {
    console.log('Nothing to fetching...');
    return stopProcess();
  }

  getMergeLog(id)
    .then(logs => {
      console.log(JSON.stringify(logs));
      const keys = Object.keys(logs);
      if (keys.length === 0) {
        select.add(createOption('0', 0));
        window.sessionStorage.setItem('logs', JSON.stringify({'0': {incomingRecord: {}, databaseRecord: {}, mergedRecord: {}}}));
        stopProcess();
        // TODO toast 404 not found
        select.value = 0;
        return select.dispatchEvent(new Event('change'));;
      }

      const refactorLogs = Object.fromEntries(keys.map(key => [logs[key].blobSequence, logs[key]]));
      const refactoredKeys = Object.keys(refactorLogs);
      window.sessionStorage.setItem('logs', JSON.stringify(refactorLogs));
      select.removeAttribute('disabled');
      refactoredKeys.forEach(key => {
        select.add(createOption(key, key));
      });

      if (sequence !== 0 && refactoredKeys.includes(sequence)) {
        select.value = sequence;
      }
      select.dispatchEvent(new Event('change'));

      stopProcess();
    })
}

window.loadLog = (event) => {
  eventHandled(event)
  const logs = JSON.parse(window.sessionStorage.getItem('logs'));

  showRecord(logs[event.target.value].incomingRecord, "record1", {}, 'viewer');
  showRecord(logs[event.target.value].databaseRecord, "record2", {}, 'viewer');
  showRecord(logs[event.target.value].mergedRecord, "record3", {}, 'viewer');
}

window.copyLink = function (event) {
  eventHandled(event)

  const id = document.querySelector(`#viewer #id`).value || '';
  const sequence = document.querySelector(`#viewer #sequence`).value || '';
  if (id === '' || sequence === '') {
    navigator.clipboard.writeText(window.location);
    return;
  }

  navigator.clipboard.writeText(`${window.location}?id=${id}&sequence=${sequence}`);
}

window.protect = function (event = undefined) {
  eventHandled(event)
  console.log('Protecting...');


  const id = document.querySelector(`#viewer #id`).value || '';
  const sequence = document.querySelector(`#viewer #sequence`).value || 1;

  if (id === '') {
    console.log('Nothing to protect...');
    return;
  }

  protectLog(id, sequence)
    .then(response => console.log(response));
}

window.remove = function (event = undefined) {
  eventHandled(event)
  console.log('Removing...');
  startProcess();

  const id = document.querySelector(`#viewer #id`).value || '';
  const logType = 'MERGE_LOG';

  if (id === '') {
    console.log('Nothing to remove...');
    return stopProcess();
  }

  removeLog(id, logType)
    .then(response => {
      console.log(response)
      stopProcess();
    });
}

function createOption(text, value) {
  const option = document.createElement("option");
  option.text = text;
  option.value = value;

  return option;
}