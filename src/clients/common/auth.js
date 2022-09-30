//*****************************************************************************
//
// Authentication to REST services
//
//*****************************************************************************

import {authVerify, authRequest} from "./rest.js";
import {reload, resetForms, showTab} from "./ui-utils.js"
import {startProcess, stopProcess} from "./ui-utils.js";

//*****************************************************************************
//
// stored auth token
//
//*****************************************************************************

export const Account = {
  storage: window.sessionStorage,
  name: 'melinda-user',

  //---------------------------------------------------------------------------

  get(jsonField = this.name) {
    try {
      return JSON.parse(this.storage.getItem(jsonField));
    } catch (e) {
      return undefined;
    }
  },
  set(token) {
    return this.storage.setItem(this.name, JSON.stringify(token));
  },
  remove() {
    return this.storage.removeItem(this.name);
  },

  getToken() {
    const user = Account.get();
    if (!user) return null;

    return user.Token;
  },

  //---------------------------------------------------------------------------

  verify() {
    return authVerify(this.getToken())
  },

  login(username, password) {
    const token = createToken(username, password);

    return authRequest(token).then(user => {
      if (user) {
        //console.log("Storing user", user);
        this.set(user);
      }

      console.log(user);
      return user;
    })

    function createToken(username, password = '') {
      //const encoded = Buffer.from(`${username}:${password}`).toString('base64');
      const encoded = btoa(`${username}:${password}`);
      return `Basic ${encoded}`;
    }
  },

  logout() {
    this.remove()
  }

  //---------------------------------------------------------------------------
};

//*****************************************************************************
//
// Login & logout
//
//*****************************************************************************

export function doLogin(onSuccess) {

  window.login = function (e) {
    eventHandled(e)

    logininfo('');

    const termschecked = document.querySelector('#login #acceptterms').checked;
    if (!termschecked) {
      logininfo('Tietosuojaselosteen hyväksyminen vaaditaan');
      return;
    }

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    startProcess();

    Account.login(username, password)
      .then(user => onSuccess(user))
      .catch(err => {
        console.log(err);
        Account.remove();
        logininfo('Tunnus tai salasana ei täsmää');
      })
      .finally(stopProcess);
    function logininfo(msg) {
      const infodiv = document.querySelector('#login #info');
      infodiv.innerHTML = msg;
    }
  }

  Account.verify()
    .then(response => onSuccess(Account.get()))
    .catch(noAuth);

  function noAuth() {
    Account.remove();
    resetForms(document.getElementById('root'));
    showTab('login');
  }
}

export function logout(e) {
  Account.logout();
  reload();
}
