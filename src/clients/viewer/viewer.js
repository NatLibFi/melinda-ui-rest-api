//*****************************************************************************
//
// New "Reactless" Muuntaja Sketch
//
//*****************************************************************************

import {setNavBar, startProcess, stopProcess} from "/common/ui-utils.js";
import {showTab, resetForms, reload} from "/common/ui-utils.js";
import {createMenuBreak, createMenuItem, createMenuSelection} from "../common/ui-utils.js";

import {Account, doLogin, logout} from "/common/auth.js"
import {transformRequest} from "/common/rest.js";
import {showRecord} from "/common/marc-record-ui.js";
import {getMatchLog, getMergeLog} from "../common/rest.js";

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
    const {id, sequence} = parseUrlParameters();
  }

  function parseUrlParameters() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id') || '';
    const sequence = urlParams.get('sequence') || '';

    document.querySelector(`#viewer #id`).defaultValue = id;
    document.querySelector(`#viewer #sequence`).defaultValue = sequence;

    return {id, sequence};
  }
}

//-----------------------------------------------------------------------------

window.onAccount = function (e) {
  console.log('Account:', e);
  logout();
}

//-----------------------------------------------------------------------------
// Do transform
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

  console.log('Fetching...');

  if (id === '') {
    console.log('Nothing to fetching...');
    return;
  }

  window.history.pushState('', 'viewer', `/viewer/?id=${id}&sequence=${sequence}`);
  //id=74dce3cb-4205-426c-8fad-4389e785e9eb
  //sequence=11
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
    })
}

window.copyLink = function () {
  navigator.clipboard.writeText(window.location);
}
