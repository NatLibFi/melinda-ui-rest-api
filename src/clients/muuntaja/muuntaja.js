//*****************************************************************************
//
// New "Reactless" Muuntaja Sketch
//
//*****************************************************************************

import {startProcess, stopProcess} from "../common/ui-utils.js";
import {showTab, resetForms, reload} from "../common/ui-utils.js";
import {createMenuBreak, createMenuItem, createMenuSelection} from "../common/ui-utils.js";

import {melindaUser, createToken} from "../common/auth.js"
import {authRequest, authVerify, profileRequest, transformRequest} from "../common/rest.js";
import {transformed, showTransformed, stripFieldDecorations} from "../common/marc-record-ui.js";

//-----------------------------------------------------------------------------
// on page load:
//-----------------------------------------------------------------------------

window.initialize = function () {
  console.log('Initializing');

  // Get auth token, if it exists
  const user = melindaUser.get();
  const token = user && user.Token || null;

  authVerify(token)
    .then(response => authSuccess(user))
    .catch(noAuth);

  function noAuth() {
    melindaUser.remove();
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
  const token = createToken(username, password);

  startProcess();

  authRequest(token)
    .then(user => authSuccess(user))
    .catch(err => {
      melindaUser.remove();
      logininfo('Tunnus tai salasana ei täsmää');
    })
    .finally(stopProcess);

  function logininfo(msg) {
    const infodiv = document.querySelector('#login #info');
    infodiv.innerHTML = msg;
  }
}

function logout(e) {
  melindaUser.remove();
  reload();
}

function authSuccess(user) {

  if (user) {
    melindaUser.set(user);
  }

  profileRequest()
    .then(profiles => {
      setProfiles(profiles);

      const username = document.querySelector("#account-menu #username")
      username.innerHTML = melindaUser.get()["Name"];
      showTab('muuntaja');
      doTransform();
    })
}

//-----------------------------------------------------------------------------

function setProfiles(profiles) {
  console.log("Profiles:", profiles)
  const menu = document.querySelector("#profile-menu");
  menu.innerHTML = ""

  menu.appendChild(createMenuItem("Muunnostyyppi", "menu-header"))

  for (const type in profiles.types) {
    console.log("Type:", type);
    //const item = createMenuItem(profiles.types[type], "menu-item");
    const item = createMenuSelection("profile", type, profiles.types[type], "menu-item")
    item.addEventListener("click", (event) => {return setProfile(event, type);});
    menu.appendChild(item);
  }

  menu.appendChild(createMenuBreak())
  menu.appendChild(createMenuItem("Muunnosprofiili", "menu-header"))
  menu.appendChild(createMenuItem("KVP", "menu-item"))
}

function setProfile(event, profile) {
  transformed.profile = profile;
  delete transformed.base.record;
  doTransform();
  return eventHandled(event);
}

//-----------------------------------------------------------------------------

window.onNew = function (e) {
  console.log('New:', e);
  resetForms(document.getElementById('muuntaja'));
  return eventHandled(e);
}

window.onEdit = function (e) {
  console.log('Edit:', e);
  editmode = !editmode;
  if (editmode) {
    e.target.style.background = "lightblue"
  } else {
    e.target.style.background = ""
  }
  showTransformed()
  return eventHandled(e);
}

window.onSearch = function (e) {
  console.log('Search:', e);
  //const dialog = document.getElementById('searchDlg');
  //console.log('Dialog:', dialog);
  //dialog.show();
}

window.onSave = function (e) {
  console.log('Save:', e);
  return eventHandled(e);
}

window.onSettings = function (e) {
  console.log('Settings:', e);
  return eventHandled(e);
}

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
      showTransformed(decorateRecords(records));
      stopProcess();
    });
}

// Strip record decorations

function stripDecorations(query) {
  const {source, base, transformed, result} = query;
  return {
    ...query,
    source: stripRecordDecorations(source),
    base: stripRecordDecorations(base),
    transformed: stripRecordDecorations(transformed),
    result: stripRecordDecorations(result),
  }
}

function stripRecordDecorations(record) {
  if (record && record.record) {
    return {
      ...record,
      record: {
        ...record.record,
        fields: record.record.fields.map(stripFieldDecorations)
      }
    }
  } else {
    return record;
  }
}

// Record decorations

function decorateRecords(transformed) {

  //records = stripDecorations(records);

  const sourceFields = getFields(transformed.source.record);
  const baseFields = getFields(transformed.base.record);
  const resultFields = getFields(transformed.result.record);

  const sourceUUIDs = getUUIDs(sourceFields);
  const baseUUIDs = getUUIDs(baseFields);
  const resultUUIDs = getUUIDs(resultFields);

  setFields(transformed.source.record,
    sourceFields.map(f => resultUUIDs.includes(f.uuid) ? {...f, from: "source"} : f)
  );
  setFields(transformed.base.record,
    baseFields.map(f => resultUUIDs.includes(f.uuid) ? {...f, from: "base"} : f)
  );
  setFields(transformed.result.record, resultFields
    .map(f => sourceUUIDs.includes(f.uuid) ? {...f, from: "source"} : f)
    .map(f => baseUUIDs.includes(f.uuid) ? {...f, from: "base"} : f)
  );

  return transformed;

  function getFields(record) {
    return record ? record.fields : [];
  }

  function getUUIDs(fields) {
    return fields.map(f => f.uuid).filter(uuid => uuid);
  }

  function setFields(record, fields) {
    if (record) record.fields = fields;
  }
}