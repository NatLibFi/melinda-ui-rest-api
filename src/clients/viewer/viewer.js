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
    document.querySelector(`#viewer #sequence`).defaultValue = sequence;
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
  const sequence = document.querySelector(`#viewer #sequence`).value || 1;

  doFetch(event, id, sequence);
}

window.doFetch = function (event = undefined, id = '', sequence) {
  eventHandled(event)
  startProcess();
  console.log('Fetching...');

  if (id === '') {
    console.log('Nothing to fetching...');
    return stopProcess();
  }

  getMergeLog(id, sequence)
    .then(response => {
      console.log('Got response!');
      console.log(response);
      return response.json();
    })
    .then(log => {
      console.log(log);
      showRecord(log[0].incomingRecord, "record1", {}, 'viewer');
      showRecord(log[0].databaseRecord, "record2", {}, 'viewer');
      showRecord(log[0].mergedRecord, "record3", {}, 'viewer');
      stopProcess();
    })
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