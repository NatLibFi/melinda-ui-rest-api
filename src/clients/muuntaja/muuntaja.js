//*****************************************************************************
//
// New "Reactless" Muuntaja Sketch
//
//*****************************************************************************

//-----------------------------------------------------------------------------

const RESTurl = 'http://localhost:8081';

//-----------------------------------------------------------------------------
// stored auth token
//-----------------------------------------------------------------------------

const melindaUser = {
  storage: window.sessionStorage,
  name: 'melinda-user',
  get (jsonField = this.name) {
    try {
      return JSON.parse(this.storage.getItem(jsonField));
    } catch (e) {
      return undefined;
    }
  },
  set (token) {
    return this.storage.setItem(this.name, JSON.stringify(token));
  },
  remove () {
    return this.storage.removeItem(this.name);
  }
};

//-----------------------------------------------------------------------------
// info needed for muuntaja merge REST call:
// - Base record
// - Transform options
// - Source record
// - Field selections
// - User edits
//-----------------------------------------------------------------------------

var transformed = {
  source: null,
  base: null,
  exclude: {},
  replace: {},
}

var editmode = false;
var editing = null;

//-----------------------------------------------------------------------------

function startProcess()
{
  const progressbar = document.querySelector(`#progressbar`);
  progressbar.className="progress-bar";
}

function stopProcess()
{
  const progressbar = document.querySelector(`#progressbar`);
  progressbar.className="progress-bar-inactive";
}

function showTab(...tabs) {
  const root = document.getElementById('root');
  for (const child of root.children) {
    if (tabs.includes(child.getAttribute('id'))) {
      child.hidden = false;
      child.style.display = null;
    } else {
      child.hidden = true;
      child.style.display = 'none';
    }
  }
}

function resetForms(...elems) {
  for (const elem of elems) {
    const forms = elem.querySelectorAll('form');
    for (const form of forms) {
      form.reset();
    }
  }
}

function reload() {
  // Programmatically reload page and reset forms
  location.reload();
}

//-----------------------------------------------------------------------------
// on page load:
//-----------------------------------------------------------------------------

function initialize() {
  console.log('Initializing');

  // Get auth token, if it exists
  const user = melindaUser.get();
  console.log('User:', user);

  if (user && user.Token) {
    authRequest(user.Token, '/verify')
      .then(response => {
        if (!response.ok) {
          return noAuth();
        }
        authSuccess(response);
      });
  } else {
    return noAuth();
  }

  function noAuth() {
    melindaUser.remove();
    resetForms(document.getElementById('root'));
    showTab('login');
  }
}

//-----------------------------------------------------------------------------
// Login & logout
//-----------------------------------------------------------------------------

function authSuccess(response) {
  const user = JSON.parse(response.headers.get('User'));
  if (user) {
    console.log(user);
    melindaUser.set(user);
  }

  showTab('muuntaja');
  doTransform();
}

function authRequest(token, url = '') {
  return fetch(
    [RESTurl, 'auth', url].join('/'),
    {
      method: 'POST',
      headers: {
        Authorization: token
      }
    }
  );
}

function login(e) {
  e.preventDefault();

  console.log('Login:', e);

  logininfo('');

  const termschecked = document.querySelector('#login #acceptterms').checked;
  if (!termschecked) {
    logininfo('Tietosuojaselosteen hyväksyminen vaaditaan');
    return;
  }

  startProcess();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  console.log('User:', username, 'Password:', password);

  function generateAuthorizationHeader(username, password = '') {
    //const encoded = Buffer.from(`${username}:${password}`).toString('base64');
    const encoded = btoa(`${username}:${password}`);
    return `Basic ${encoded}`;
  }

  authRequest(generateAuthorizationHeader(username, password))
    .then(success)
    .catch(failure);
  function success(response) {
    if (!response.ok) {
      return failure();
    }
    authSuccess(response);
    logininfo('');
    stopProcess();
  }

  function failure() {
    melindaUser.remove();
    logininfo('Tunnus tai salasana ei täsmää');
    stopProcess();
  }

  function logininfo(msg) {
    const infodiv = document.querySelector('#login #info');
    infodiv.innerHTML = msg;
  }
}

function logout(e) {
  melindaUser.remove();
  reload();
}

//-----------------------------------------------------------------------------

function onNew(e) {
  console.log('New:', e);
  resetForms(document.getElementById('muuntaja'));
}

function onEdit(e) {
  console.log('Edit:', e);
  editmode = !editmode;
  if(editmode) {
    e.target.style.background = "lightblue"
  } else {
    e.target.style.background = ""
  }
  showTransformed()
}

function ignore(e) {
  console.log("Ignore")
  e.stopPropagation();
  e.preventDefault();
  return true;
}

function onSearch(e) {
  console.log('Search:', e);
  const dialog = document.getElementById('searchDlg');
  //console.log('Dialog:', dialog);
  //dialog.show();
}

function onSave(e) {
  console.log('Save:', e);
}

function onSettings(e) {
  console.log('Settings:', e);
  e.preventDefault();
  e.stopPropagation();
}

function onAccount(e) {
  console.log('Account:', e);
  logout();
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

function showTransformed()
{
  const {source, base, result} = transformed;
  showRecord(source, 'source');
  showRecord(base, 'base');
  showRecord(result, 'result', editmode = editmode);
}

//-----------------------------------------------------------------------------
// Exclude/include fields
//-----------------------------------------------------------------------------

function toggleField(event, field) {
  const uuid = field.uuid;

  console.log("Toggle:", uuid)

  if(!transformed.exclude[uuid]) {
    transformed.exclude[uuid] = stripFieldDecorations(field);
  } else {
    delete transformed.exclude[uuid];
  }
  //showTransformed();
  doTransform();
}

//-----------------------------------------------------------------------------
// Field edit
//-----------------------------------------------------------------------------

function editField(event, field) {
  // Edit-ohje: https://marc21.kansalliskirjasto.fi/bib/05X-08X.htm#050 

  editing = transformed.transformed.record.fields.find(f => f.uuid == field.uuid);

  console.log("Edit:", editing);

  // Find field from edited fields, if found, fill in data from there

  const dlg = document.querySelector("#fieldEditDlg")
  //console.log(dlg)
  dlg.style.display = "flex"

  const content = document.querySelector("#fieldEditDlg #field");
  content.innerHTML = ""
  addField(content, editing);

  const tag = document.querySelector("#fieldEditDlg #tag");
  tag.innerHTML = ""
  tag.appendChild(createInput('tag', 'tag', field.tag))

  const ind1 = document.querySelector("#fieldEditDlg #ind1");
  ind1.innerHTML = ""
  ind1.appendChild(createInput('ind1', 'inds', field.ind1))

  const ind2 = document.querySelector("#fieldEditDlg #ind2");
  ind2.innerHTML = ""
  ind2.appendChild(createInput('ind2', 'inds', field.ind2))

  const subfields = document.querySelector("#fieldEditDlg #fieldlist");
  subfields.innerHTML = ""

  for (const subfield of field.subfields) {
    subfields.appendChild(createSubfield(subfields, subfield));
  }

//*
  Sortable.create(subfields, {
    ghostClass: 'ghost-row',
    animation: 50,
  })
/**/
}

function createSubfield(parent, subfield) {
  const row = document.createElement("div")
  row.classList.add("subfield")
  row.appendChild(removeButton());
  row.appendChild(createInput('code', 'code', subfield.code));
  row.appendChild(createInput('value', 'value', subfield.value));
  return row;

  function removeButton() {
    const btn = document.createElement('button');
    btn.classList.add("material-icons");
    btn.innerHTML = "close";
    btn.addEventListener("click", event => {
      const state = row.getAttribute("disabled");
      if(state) {
        row.removeAttribute("disabled");
      } else {
        row.setAttribute("disabled", true);
      }
      return true;
    })
    return btn;  
  }
}

function createInput(name, className, value, editable = true) {
  const input = document.createElement('span');
  input.setAttribute('id', name);
  input.classList.add(className);
  if(editable) {
    input.classList.add('editable')
  }
  input.innerHTML = value;
  input.contentEditable = editable;
  return input;
}

function onAddField(event) {
  const subfields = document.querySelector("#fieldEditDlg #fieldlist");
  subfields.appendChild(createSubfield(subfields, {code: '?', value: '?'}))
  //event.preventDefault();
  //event.stopPropagation();
  return true;
}

function editDlgOK(event) {
  // Read tag & indicators
  const tag = document.querySelector("#fieldEditDlg #tag #tag").innerHTML;
  const ind1 = document.querySelector("#fieldEditDlg #ind1 #ind1").innerHTML;
  const ind2 = document.querySelector("#fieldEditDlg #ind2 #ind2").innerHTML;

  var field = {
    tag: tag,
    ind1: ind1,
    ind2: ind2,
    subfields: [],
    uuid: editing.uuid,
  }

  //console.log("Tag:", tag, ind1, ind2)

  // Read fields
  const subfields = document
    .querySelector("#fieldEditDlg #fieldlist")
    .getElementsByClassName("subfield");
  //console.log("Fields:", subfields);

  for(subfield of subfields) {

    if(subfield.getAttribute("disabled")) continue;

    const code  = subfield.getElementsByClassName("code")[0].innerHTML;
    const value = subfield.getElementsByClassName("value")[0].innerHTML;
    //console.log("Field code:", code, "value:", value)
    field.subfields.push({
      code: code,
      value: value,
    })
  }

  //console.log("Original:", editing)
  console.log("Edited:", field)

  transformed.replace[field.uuid] = stripFieldDecorations(field);
  doTransform();
  
  return editDlgClose(event);
}

function editDlgUseOriginal(event) {
  console.log("Using original.");
  delete transformed.replace[editing.uuid];
  doTransform();
  return editDlgClose(event);
}

function editDlgClose(event) {
  const dlg = document.querySelector("#fieldEditDlg")
  //console.log("Close:", dlg)
  dlg.style.display = "none"
  return true;
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

function showRecord(data, dest, editmode = false) {
  //console.log("Show Record:", data);

  const sourceDiv = document.querySelector(`#muuntaja .record-merge-panel #${dest} #Record`);

  // Clear previous content
  sourceDiv.innerHTML = '';

  if(!data) return;

  if(data.error) {
    const error = document.createElement('div');
    error.classList.add("error")
    error.innerHTML = data.error;
    sourceDiv.appendChild(error)
  }
  
  if(data.notes) {
    const notes = document.createElement('div');
    notes.classList.add("notes")
    notes.innerHTML = data.notes;
    sourceDiv.appendChild(notes)
  }
  
  if(data.record)
  {
    const record = data.record;

    addField(sourceDiv, {tag: 'LDR', value: record.leader}, editmode);
    for (const field of record.fields) {
      const row = addField(sourceDiv, field, editmode);
      if(field.uuid) {
        if(editmode) {
          if(field.subfields) row.addEventListener("click", event => editField(event, field))
          /* Add here custom field editors */
        } else {
          row.addEventListener("click", event => toggleField(event, field))
        }
      }
    }
  }
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

function addField(div, field, editmode = false) {
  //console.log(field)
  const row = document.createElement('div');
  row.setAttribute('class', 'row');

  if(transformed.exclude[field.uuid]) {
    row.classList.add("row-excluded");
  } else if(transformed.replace[field.uuid]) {
    row.classList.add("row-replaced");
  } else if(field.from == "source") {
    row.classList.add("row-fromSource")
  } else if(field.from == "base") {
    row.classList.add("row-fromBase")
  }

  addTag(row, field.tag);
  addInd(row, field.ind1, field.ind2);

  if (field.value) {
    addValue(row, field.value);
  } else if (field.subfields) {
    for (const subfield of field.subfields) {
      addSubfield(row, subfield);
    }
  }

  div.appendChild(row);
  return row;

  //---------------------------------------------------------------------------
  
  function addTag(row, value) {
    row.appendChild(makeSpan('tag', value));
  }

  function addInd(row, ind1, ind2) {
    const span = makeSpan('inds');
    add(span, ind1);
    add(span, ind2);
    row.appendChild(span);

    function add(span, ind) {
      const value = ind && ind.trim() || '&nbsp;';
      span.appendChild(makeSpan('ind', value));
    }
  }

  function addValue(row, value) {
    row.appendChild(makeSpan('value', value));
  }

  function addSubfield(row, subfield) {
    const span = makeSpan('subfield');
    span.appendChild(makeSubfieldCode(subfield.code));
    span.appendChild(makeSubfieldData(subfield.value));
    row.appendChild(span);
  }

  function makeSubfieldCode(code) {
    return makeSpan('code', `‡${code}`);
  }

  function makeSubfieldData(value) {
    return makeSpan('value', value);
  }
}

function makeDiv(className, value) {
  const div = document.createElement('div');
  div.setAttribute('class', className);
  if (value) {
    div.innerHTML = value;
  }
  return div;
}

function makeSpan(className, value) {
  const span = document.createElement('span');
  span.setAttribute('class', className);
  if (value) {
    span.innerHTML = value;
  }
  return span;
}

//-----------------------------------------------------------------------------
// Do transform
//-----------------------------------------------------------------------------

function doTransform(event = undefined) {
  console.log('Transforming');
  if(event) event.preventDefault();

  const user = melindaUser.get();
  //console.log('User:', user);
  if(!user) return;
  
  const token = user.Token;

  // console.log("Token:", token);

  if (!token) return;

  const sourceID = document.querySelector(`#muuntaja .record-merge-panel #source #ID`).value;
  const baseID = document.querySelector(`#muuntaja .record-merge-panel #base #ID`).value;

  if(!transformed.source || sourceID != transformed.source.ID) {
    transformed.source = { ID: sourceID }
  }

  if(!transformed.base || baseID != transformed.base.ID) {
    transformed.base = { ID: baseID }
  }

  //console.log('Source ID:', sourceID);
  //console.log('Base ID:', baseID);
  console.log("Transforming:", transformed);

  startProcess();

  fetch(
    `${RESTurl}/muuntaja/transform`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify(stripDecorations(transformed))
    }
  )
    .then(response => response.json())
    .then(records => {
      console.log('Transformed:', records);
      transformed = decorateRecords(records)
      showTransformed();
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
  if(record && record.record) {
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

function stripFieldDecorations(f) {
  return {
    tag: f.tag,
    ind1: f.ind1,
    ind2: f.ind2,
    value: f.value,
    subfields: f.subfields,
    uuid: f.uuid,
  }
}

// Record decorations

function decorateRecords(records) {

  //records = stripDecorations(records);

  if(records.result.record) {
    const sourceFields = records.source.record.fields;
    const baseFields   = records.base.record.fields;
    const resultFields = records.result.record.fields;

    sourceUUIDs = sourceFields.map(f => f.uuid);
    baseUUIDs   = baseFields.map(f => f.uuid);
    resultUUIDs = resultFields.map(f => f.uuid);

    records.source.record.fields = sourceFields.map(f => resultUUIDs.includes(f.uuid) ? { ...f, from: "source"} : f)
    records.base.record.fields = baseFields.map(f => resultUUIDs.includes(f.uuid) ? { ...f, from: "base"} : f)
    records.result.record.fields = resultFields
      .map(f => sourceUUIDs.includes(f.uuid) ? { ...f, from: "source"} : f)
      .map(f => baseUUIDs.includes(f.uuid) ? { ...f, from: "base"} : f);
  }

  return records;
}