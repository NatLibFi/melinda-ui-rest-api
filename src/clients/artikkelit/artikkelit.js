import {idbClearAllTables} from '/artikkelit/actions/articleReset.js'
import {initArticleForm} from '/artikkelit/actions/articleInitialize.js';
import {Account, doLogin, logout} from '/common/auth.js';
import {showTab, showNotification} from '/common/ui-utils.js';
import {} from '/artikkelit/actions/articleCheck.js';
import {} from '/artikkelit/actions/articleSave.js';
import {} from '/artikkelit/actions/articleStartNew.js';
import {getNotifications} from '../common/notification.js';


window.initialize = function () {
  console.log('Initializing artikkelit');

  checkNotificationsAndDoLogin();

  function checkNotificationsAndDoLogin(){
    getNotifications('artikkelit')
    .then(notificationObject => {
      //generate appropriate ui items
      if(notificationObject.hasBlocks){
        showNotification(notificationObject.blocking);
        return;
      }

      showNotification(notificationObject.notBlocking);
      doLogin(authSuccess);
    })
    .catch(err => {
      console.log('Notification fetch failed');
      console.log(err);
      showNotification({componentStyle: 'dialog', style: 'alert', text: 'Palvelin viestien haku epäonnistui', isDismissible: true});
      doLogin(authSuccess);
    });
  }
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
