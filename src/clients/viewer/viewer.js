//*****************************************************************************
//
// New "Reactless" Muuntaja Sketch
//
//*****************************************************************************

import {startProcess, stopProcess} from "../common/ui-utils.js";
import {showTab, resetForms, reload} from "../common/ui-utils.js";
import {createMenuBreak, createMenuItem, createMenuSelection} from "../common/ui-utils.js";

import {Account} from "../common/auth.js"
import {transformRequest} from "../common/rest.js";
import {transformed, showRecord} from "../common/marc-record-ui.js";

//-----------------------------------------------------------------------------
// on page load:
//-----------------------------------------------------------------------------

window.initialize = function () {
  console.log('Initializing');

  Account.verify()
    .then(response => authSuccess(Account.get()))
    .catch(noAuth);

  function noAuth() {
    Account.remove();
    resetForms(document.getElementById('root'));
    showTab('login');
  }
}

//-----------------------------------------------------------------------------
// Login & logout
//-----------------------------------------------------------------------------

window.login = function (e) {
  e.preventDefault();

  console.log('Login:', e);

  logininfo('');

  const termschecked = document.querySelector('#login #acceptterms').checked;
  if (!termschecked) {
    logininfo('Tietosuojaselosteen hyväksyminen vaaditaan');
    return;
  }

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  startProcess();

  Account.login(username, password)
    .then(user => authSuccess(user))
    .catch(err => {
      Account.remove();
      logininfo('Tunnus tai salasana ei täsmää');
    })
    .finally(stopProcess);

  function logininfo(msg) {
    const infodiv = document.querySelector('#login #info');
    infodiv.innerHTML = msg;
  }
}

function logout(e) {
  Account.logout();
  reload();
}

function authSuccess(user) {
  const username = document.querySelector("#account-menu #username")
  username.innerHTML = Account.get()["Name"];
  showTab('muuntaja');
  doTransform();
}

//-----------------------------------------------------------------------------

window.onAccount = function (e) {
  console.log('Account:', e);
  logout();
}

window.ignore = function (e) {
  console.log("Ignore")
  return eventHandled(e);
}

window.eventHandled = function (e) {
  e.stopPropagation();
  e.preventDefault();
  return true;
}

//-----------------------------------------------------------------------------
// Do transform
//-----------------------------------------------------------------------------

window.doTransform = function (event = undefined) {
  console.log('Transforming');
  if (event) event.preventDefault();

  //console.log('Source ID:', sourceID);
  //console.log('Base ID:', baseID);
  console.log("Transforming:", transformed);

  startProcess();

  const sourceID = document.querySelector(`#muuntaja .record-merge-panel #source #ID`).value;
  const baseID = document.querySelector(`#muuntaja .record-merge-panel #base #ID`).value;

  if (!transformed.source || sourceID != transformed.source.ID) {
    transformed.source = {ID: sourceID}
  }

  if (!transformed.base || baseID != transformed.base.ID) {
    transformed.base = {ID: baseID}
  }

  transformRequest(transformed)
    .then(response => response.json())
    .then(records => {
      console.log('Transformed:', records);
      showRecord(records.source, 'source');
      showRecord(records.base, 'base');
      stopProcess();
    });
}
