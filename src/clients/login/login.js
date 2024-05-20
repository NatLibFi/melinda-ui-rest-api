import {showNotification, showServerNotifications, showTab} from '/common/ui-utils.js';
import { Account, doLogin, logout } from '/common/auth.js';

//-----------------------------------------------------------------------------------------
// Initialize on page load
//-----------------------------------------------------------------------------------------

window.initialize = function () {
    console.log('Initializing');
};

window.onload = function() {
    console.log('On load');

    showServerNotifications({clientName: 'login', onSuccess: () => { doLogin(authSuccess); } });

    function authSuccess(user) {
        const accountMenu = document.getElementById('accountMenu');
        accountMenu.classList.add('show');
        const username = document.querySelector('#accountMenu #username');
        username.innerHTML = Account.get().Name;
        showTab('homePage');
    }
};

window.onAccount = function (e) {
    //console.log('Account:', e);
    logout();
  };