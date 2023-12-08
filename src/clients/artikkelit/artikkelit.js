import {idbClearAllTables} from '/artikkelit/actions/articleReset.js'
import {initArticleForm} from '/artikkelit/actions/articleInitialize.js';
import {Account, doLogin, logout} from '/common/auth.js';
import {showTab} from '/common/ui-utils.js';
import {} from '/artikkelit/actions/articleCheck.js';
import {} from '/artikkelit/actions/articleSave.js';


window.initialize = function () {
  console.log('Initializing');

  doLogin(authSuccess);

  function authSuccess(user) {
    const accountMenu = document.getElementById('accountMenu');
    accountMenu.classList.add('show');
    const username = document.querySelector('#accountMenu #username');
    username.innerHTML = Account.get().Name;
    showTab('artikkelit');
    initArticleForm();
  }
};

window.onAccount = function (e) {
  console.log('Account:', e);
  idbClearAllTables();
  logout();
};
