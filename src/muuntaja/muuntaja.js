//*****************************************************************************
//
// New "Reactless" Muuntaja Sketch
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// stored auth token
//-----------------------------------------------------------------------------

const melindaUser = {
  storage: window.sessionStorage,
  name: "melinda-user",
  get: function() {
    try {
      return JSON.parse(this.storage.getItem(this.name));
    } catch(e) {
      return undefined;
    }
  },
  set: function(token) { return this.storage.setItem(this.name, JSON.stringify(token)); },
  remove: function() { return this.storage.removeItem(this.name); }  ,
}

//-----------------------------------------------------------------------------

function showTab(...tabs) {
  const root = document.getElementById('root');
  for (const child of root.children) {
    if (tabs.includes(child.getAttribute('id'))) {
      child.hidden = false;
    } else {
      child.hidden = true;
    }
  }
}

function resetForms(...elems) {
  for(const elem of elems) {
    const forms = elem.querySelectorAll("form");
    for(const form of forms) form.reset();
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
  console.log("User:", user);

  if(user && user.Token) {
    authRequest(user.Token)
      .then(response => {
        if(!response.ok) return noAuth();
        authSuccess(response);
      })
  }
  else {
    return noAuth();
  }

  function noAuth() {
    melindaUser.remove();
    resetForms(document.getElementById("root"))
    showTab("login");  
  }
}

//-----------------------------------------------------------------------------
// Login & logout
//-----------------------------------------------------------------------------

function authSuccess(response) {
  const user = JSON.parse(response.headers.get("User"));
  console.log(user);
  melindaUser.set(user);
  showTab("muuntaja");
}

function authRequest(token) {
  return fetch(
    "http://localhost:8081/auth",
    {
      method: "POST",
      headers: {
        Authorization: token,
      }
    }
  )
}

function login(e) {
  e.preventDefault();

  console.log("Login:", e)

  logininfo("");

  const termschecked = document.querySelector("#login #acceptterms").checked;
  if(!termschecked) {
    logininfo("Tietosuojaselosteen hyväksyminen vaaditaan");
    return;
  }
  
  logininfo('<div class="progress-bar"></div>');
  
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  console.log("User:", username, "Password:", password)

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
    if(!response.ok) return failure();
    authSuccess(response);
    logininfo("");
  }

  function failure() {
    melindaUser.remove();
    logininfo("Tunnus tai salasana ei täsmää");
  }

  function logininfo(msg) {
    const infodiv = document.querySelector("#login #info")
    infodiv.innerHTML = msg;
  }  
}

function logout(e) {
  melindaUser.remove();
  reload();
}

//-----------------------------------------------------------------------------

function onNew(e) {
  console.log("New:", e)
  resetForms(document.getElementById("muuntaja"))
}

function onSearch(e) {
  console.log("Search:", e);
  const dialog = document.getElementById("searchDlg");
  console.log("Dialog:", dialog)
  //dialog.show();
}

function onSave(e) {
  console.log("Save:", e)
}

function onSettings(e) {
  console.log("Settings:", e)
}

function onAccount(e) {
  console.log("Account:", e)
  logout();
}

//-----------------------------------------------------------------------------
// Authentication
//-----------------------------------------------------------------------------

// Auth header
// backend-commons / commons?

/*
async function getAuthToken(username, password) {
  const encodedCreds = generateAuthorizationHeader(username, password);
  const response = await fetch(`${url}/auth`, {
    method: 'POST',
    headers: {
      //'User-Agent': userAgent,
      Authorization: encodedCreds
    }
  });

  if (response.status === HttpStatus.NO_CONTENT) {
    return response.headers.get('Token');
  }

  throw new ApiError(response.status);
}
*/

/*
// Rest fetch
const uri = `http://localhost:8081/bib/${melindaId}`;

let h = new Headers();
h.append("Accepts", "application/json");

const req = new Request(uri, {
  method: "GET",
  mode: "no-cors",
  headers: h,
  credentials: 'same-origin'
});

fetch(req)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    insertRecord(data);
  });
*/

//*****************************************************************************

/*
    onload --> tarkasta selaimen storagesta, onko siellä muuntaja-avain (päätä nimi)
    melinda-rest-api -avain = jaetaan kaikkien apukäyttöliittymien kanssa
    tallenna token, ei user-passwd -paria (response.headers.get("Token"))
    Jos avain löytyy -->

      1. lähetetään REST:iin (tee auth -route): Auth-route:
         https://github.com/NatLibFi/melinda-record-import-api/blob/master/src/routes/auth.js

      2. katotaan, onko validi (millä kutsulla? Pyydetään recordia):
         https://github.com/NatLibFi/melinda-record-import-commons-js/blob/4ff4d2dea852ed91d41a531a650874b57ced07d2/src/api-client.js#L317
         // Koeta löytää selaimen kirjautumistiedot resetointia varten

      3. Jos on validi --> perussivun lataus (lataa apu-UI)

      4. Jos ei --> login page (käy kattoon: ui-commons) (tee reactiton login page)
         https://github.com/NatLibFi/melinda-ui-commons/blob/master/frontend/js/components/signin-form-panel.jsx

      5. Koetetaan onko validi -> jos on, tallennetaan tiedot & ladataan UI, jos ei, annetaan virheilmoitus
         (ilmoitus: salasana tai käyttäjätunnus väärin)

    UI reactiton, mutta otetaan material UI
    */

/* Field sort: muuntaja/frontend/js/marc-field-sort.js */
