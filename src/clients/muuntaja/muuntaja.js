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

const melindaMuuntaja = {
  storage: window.sessionStorage,
  name: 'melinda-muuntaja',
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
  setSourceID (id) {
    //this.storage.setItem('sourceRecordID', id);
    //doTransform();
  },
  setBaseID (id) {
    //this.storage.setItem('baseRecordID', id);
    //doTransform();
  },
  remove () {
    return this.storage.removeItem(this.name);
  }
};

var editmode = false;

var records = {
  excluded: {},
}

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

  melindaMuuntaja.setBaseID(null);
  melindaMuuntaja.setSourceID(null);

  // First, check if there is a message from server!
  // If so --> go to server note tab.
  // If server note has OK button, we go to login/muuntaja
  
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

  logininfo('<div class="progress-bar"></div>');

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
  }

  function failure() {
    melindaUser.remove();
    logininfo('Tunnus tai salasana ei täsmää');
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
}

function onAccount(e) {
  console.log('Account:', e);
  logout();
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

function showTransformed()
{
  const {source, base, result} = records;
  console.log('Transformed:', records);
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

  if(!records.excluded[uuid]) {
    records.excluded[uuid] = true;
  } else {
    delete records.excluded[uuid];
  }
  showTransformed();
}

//-----------------------------------------------------------------------------
// Field edit
//-----------------------------------------------------------------------------

function editField(event, field) {
  // Edit-ohje: https://marc21.kansalliskirjasto.fi/bib/05X-08X.htm#050 
  console.log("Edit:", field);

  const dlg = document.querySelector("#fieldEditDlg")
  console.log(dlg)
  dlg.style.display = "flex"

  const content = document.querySelector("#fieldEditDlg #field");
  content.innerHTML = ""
  addField(content, field);

  const tag = document.querySelector("#fieldEditDlg #tag");
  tag.innerHTML = ""
  tag.appendChild(createTag())

  const subfields = document.querySelector("#fieldEditDlg #fieldlist");
  subfields.innerHTML = ""

/*
  var sortable = Sortable.create(subfields, {
    //ghostClass: 'ghost-row',
    animation: 150,
  })
*/

  for (const subfield of field.subfields) {
    subfields.appendChild(createSubfield(subfield));
  }

  function createTag() {
    const row = makeDiv("tagrow");
    row.appendChild(makeInput('tag', field.tag));
    row.appendChild(makeInput('ind', field.ind1));
    row.appendChild(makeInput('ind', field.ind2));
    return row;
  }

  function createSubfield(subfield) {
    const row = document.createElement("div")
    row.classList.add("row")
    row.appendChild(createField('code', subfield.code));
    row.appendChild(createField('value', subfield.value));
    return row;

    function createField(className, value, editable = true) {
      const input = document.createElement('span');
      input.classList.add(className)
      input.innerHTML = value;
      input.contentEditable = editable;
      return input;
    }
  }

  function makeInput(className, value) {
    const input = document.createElement('span');
    input.setAttribute('class', className);
    if (value) {
      input.innerHTML = value;
    }
    input.contentEditable = true;
    return input;
  }
}

function editDlgClose(event) {
  const dlg = document.querySelector("#fieldEditDlg")
  console.log("Close:", dlg)
  dlg.style.display = "none"
  return true;
}

function editDlgOK(event) {
  return editDlgClose(event);
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

function showRecord(data, dest, editmode = false) {
  console.log("Show Record:", data);

  const sourceDiv = document.querySelector(`#muuntaja .record-merge-panel #${dest} #Record`);

  // Clear previous content
  sourceDiv.innerHTML = '';

  if(!data) return;

  if(data.error) {
    sourceDiv.innerHTML = data.error;
  }
  
  if(data.notes) {
    sourceDiv.innerHTML = data.notes;
  }
  
  if(data.record)
  {
    const record = data.record;

    addField(sourceDiv, {tag: 'LDR', value: record.leader}, editmode);
    for (const field of record.fields) {
      addField(sourceDiv, field, editmode);
    }
  }
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

function addField(div, field, editmode = false) {
  //console.log(field)
  const row = document.createElement('div');
  row.setAttribute('class', 'row');

  if(editmode) {
    row.addEventListener("click", event => editField(event, field))
  } else if(field.uuid) {
    row.classList.add("row-toggable");
    if(!records.excluded[field.uuid]) {
      row.classList.add("row-selected");
    } else {
      row.classList.add("row-unselected");
    }
    row.addEventListener("click", event => toggleField(event, field))
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
  //return row;
  div.appendChild(row);

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

  console.log('Source ID:', sourceID);
  console.log('Base ID:', baseID);

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
      body: JSON.stringify({
        source: {
          ID: sourceID,
        },
        base: {
          ID: baseID,
        },
        excluded: records.excluded,
      })
    }
  )
    .then(response => response.json())
    .then(transformed => {
      records = transformed;
      showTransformed();
      stopProcess();
    });
}
