//*****************************************************************************
//
// New "Reactless" Muuntaja Sketch
//
//*****************************************************************************

//-----------------------------------------------------------------------------

const RESTurl = "http://localhost:8081";

//-----------------------------------------------------------------------------
// stored auth token
//-----------------------------------------------------------------------------

const melindaUser = {
  storage: window.sessionStorage,
  name: "melinda-user",
  get: function (jsonField = this.name) {
    try {
      return JSON.parse(this.storage.getItem(jsonField));
    } catch (e) {
      return undefined;
    }
  },
  set: function (token) {return this.storage.setItem(this.name, JSON.stringify(token));},
  setSourceRecord: function (record) {return this.storage.setItem('sourceRecord', JSON.stringify(record));},
  setBaseRecord: function (record) {return this.storage.setItem('baseRecord', JSON.stringify(record));},
  remove: function () {return this.storage.removeItem(this.name);},
};

//-----------------------------------------------------------------------------

function showTab(...tabs) {
  const root = document.getElementById('root');
  for (const child of root.children) {
    if (tabs.includes(child.getAttribute('id'))) {
      child.hidden = false;
      child.style.display = null;
    } else {
      child.hidden = true;
      child.style.display = "none";
    }
  }
}

function resetForms(...elems) {
  for (const elem of elems) {
    const forms = elem.querySelectorAll("form");
    for (const form of forms) form.reset();
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

  // First, check if there is a message from server!
  // If so --> go to server note tab.
  // If server note has OK button, we go to login/muuntaja

  // Get auth token, if it exists
  const user = melindaUser.get();
  console.log("User:", user);

  if (user && user.Token) {
    authRequest(user.Token, '/verify')
      .then(response => {
        if (!response.ok) return noAuth();
        authSuccess(response);
      });
  }
  else {
    return noAuth();
  }

  function noAuth() {
    melindaUser.remove();
    resetForms(document.getElementById("root"));
    showTab("login");
  }
}

//-----------------------------------------------------------------------------
// Login & logout
//-----------------------------------------------------------------------------

function authSuccess(response) {
  const user = JSON.parse(response.headers.get("User"));
  if (user) {
    console.log(user);
    melindaUser.set(user);
  }

  // Loads last worked records, needs to check if input fields/ storage have record ids and if not put 'em in
  const sourceRecord = melindaUser.get('sourceRecord');
  const baseRecord = melindaUser.get('baseRecord');
  getRecord(new Event('load'), 'source');
  getRecord(new Event('load'), 'base');

  showTab("muuntaja");
}

function authRequest(token, url = '') {
  return fetch(
    [RESTurl, "auth", url].join("/"),
    {
      method: "POST",
      headers: {
        Authorization: token,
      }
    }
  );
}

function login(e) {
  e.preventDefault();

  console.log("Login:", e);

  logininfo("");

  const termschecked = document.querySelector("#login #acceptterms").checked;
  if (!termschecked) {
    logininfo("Tietosuojaselosteen hyväksyminen vaaditaan");
    return;
  }

  logininfo('<div class="progress-bar"></div>');

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  console.log("User:", username, "Password:", password);

  function generateAuthorizationHeader(username, password = '') {
    //const encoded = Buffer.from(`${username}:${password}`).toString('base64');
    const encoded = btoa(`${username}:${password}`);
    return `Basic ${encoded}`;
  }

  authRequest(generateAuthorizationHeader(username, password))
    .then(success)
    .catch(failure)
    ;

  function success(response) {
    if (!response.ok) return failure();
    authSuccess(response);
    logininfo("");
  }

  function failure() {
    melindaUser.remove();
    logininfo("Tunnus tai salasana ei täsmää");
  }

  function logininfo(msg) {
    const infodiv = document.querySelector("#login #info");
    infodiv.innerHTML = msg;
  }
}

function logout(e) {
  melindaUser.remove();
  reload();
}

//-----------------------------------------------------------------------------

function onNew(e) {
  console.log("New:", e);
  resetForms(document.getElementById("muuntaja"));
}

function onSearch(e) {
  console.log("Search:", e);
  const dialog = document.getElementById("searchDlg");
  console.log("Dialog:", dialog);
  //dialog.show();
}

function onSave(e) {
  console.log("Save:", e);
}

function onSettings(e) {
  console.log("Settings:", e);
}

function onAccount(e) {
  console.log("Account:", e);
  logout();
}

//-----------------------------------------------------------------------------
// Record fetching
// TODO: Make this bit more general...
//-----------------------------------------------------------------------------

function getRecord(e, dest) {
  e.preventDefault();
  console.log("Fetch:", e);

  const recordID = document.querySelector(`#muuntaja .record-merge-panel #${dest} #ID`).value;

  if (recordID === '') {
    return;
  }

  console.log("ID:", recordID);

  const sourceDiv = document.querySelector(`#muuntaja .record-merge-panel #${dest} #Record`);
  sourceDiv.innerHTML = '<div class="progress-bar"></div>';

  const token = melindaUser.get().Token;
  console.log(token);

  fetch(
    [RESTurl, "bib", recordID].join("/"),
    {
      method: "GET",
      headers: {
        Accepts: "application/json",
        Authorization: token,
      },
    }
  )
    .then(response => response.json())
    .then(data => {
      dest === 'source' ? melindaUser.setSourceRecord(recordID) : melindaUser.setBaseRecord(recordID);
      showSourceRecord(data, dest);
    });
}

function showSourceRecord(data, dest) {
  console.log(data);

  const sourceDiv = document.querySelector(`#muuntaja .record-merge-panel #${dest} #Record`);

  // Clear previous content
  sourceDiv.innerHTML = "";

  addField(sourceDiv, {tag: "LDR", value: data.leader});
  for (const field of data.fields) {
    addField(sourceDiv, field);
  }

  //---------------------------------------------------------------------------

  function addField(div, field) {
    //console.log(field)
    const row = document.createElement('div');
    row.setAttribute('class', 'row');

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
  }

  //---------------------------------------------------------------------------
  function addTag(row, value) {
    row.appendChild(makeSpan("tag", value));
  }

  function addInd(row, ind1, ind2) {
    const span = makeSpan("inds");
    add(span, ind1);
    add(span, ind2);
    row.appendChild(span);

    function add(span, ind) {
      const value = (ind && ind.trim()) || "&nbsp;";
      span.appendChild(makeSpan("ind", value));
    }
  }

  function addValue(row, value) {
    row.appendChild(makeSpan("value", value));
  }

  function addSubfield(row, subfield) {
    const span = makeSpan("subfield");
    span.appendChild(makeSubfieldCode(subfield.code));
    span.appendChild(makeSubfieldData(subfield.value));
    row.appendChild(span);
  }

  function makeSubfieldCode(code) {
    return makeSpan("code", `‡${code}`);
  }

  function makeSubfieldData(value) {
    return makeSpan("value", value);
  }

  function makeSpan(className, value) {
    const span = document.createElement("span");
    span.setAttribute('class', className);
    if (value) span.innerHTML = value;
    return span;
  }
}

/* Field sort: muuntaja/frontend/js/marc-field-sort.js */
