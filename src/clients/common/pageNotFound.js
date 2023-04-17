import {setNavBar, showSnackbar} from './ui-utils.js';
import {Account, doLogin, logout} from "./auth.js"

window.initialize = function () {
  setNavBar(document.querySelector('#navbar'), 'Valitse sovellus');

  doLogin(authSuccess);

  showSnackbar({text: 'Sivua ei löytynyt, tarkista sivun osoite ja yritä uudelleen!', closeButton: 'true'});

  function authSuccess(user) {
    const username = document.querySelector("#account-menu #username");
    username.innerHTML = Account.get()["Name"];
  }
};

window.onAccount = function (e) {
  console.log('Account:', e);
  logout();
}

window.goBack = function (event) {
  eventHandled(event);
  window.history.back();
}

window.goHome = function (event) {
  eventHandled(event);
  window.open('/');
}
