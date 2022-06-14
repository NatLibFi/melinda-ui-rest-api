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
import {getRecord} from "../common/rest.js";

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
    showTab('muuntaja');
    doFetch();
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

window.doFetch = function (event = undefined) {
  eventHandled(event)

  console.log('Fetching...');

  const ID1 = document.querySelector(`#muuntaja .record-merge-panel #record1 #ID`).value;
  const ID2 = document.querySelector(`#muuntaja .record-merge-panel #record2 #ID`).value;
  const ID3 = document.querySelector(`#muuntaja .record-merge-panel #record3 #ID`).value;

  if(ID1 !== "" && ID1 !== record1?.ID) {
    getRecord(ID1)
      .then(response => response.json())
      .then(record => {
        transformed.record1 = record;
        showRecord(transformed.record1, "record1")
      })
  }

  if(ID2 !== "" && ID2 !== record2?.ID) {
    getRecord(ID2)
      .then(response => response.json())
      .then(record => {
        transformed.record2 = record;
        showRecord(transformed.record2, "record2")
      })
  }

  if(ID3 !== "" && ID3 !== record3?.ID) {
    getRecord(ID3)
      .then(response => response.json())
      .then(record => {
        transformed.record3 = record;
        showRecord(transformed.record3, "record3")
      })
  }
}
