import {showNotification, showTab} from '/./common/ui-utils.js';
import {Account, doLogin, logout} from '/./common/auth.js';
import {getNotifications} from '/./common/notification.js';

window.initialize = function () {
  checkNotificationsAndDoLogin();

  function checkNotificationsAndDoLogin(){
    getNotifications('pageNotFound')
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
    showTab('pageNotFound');
    showNotification({componentStyle: 'banner', style: 'alert', text: 'Sivua ei löytynyt, tarkista sivun osoite ja yritä uudelleen!'});
    showAppName(window.location.href);
    const accountMenu = document.getElementById('accountMenu');
    accountMenu.classList.add('show');
    const username = document.querySelector('#accountMenu #username');
    username.innerHTML = Account.get().Name;
  }
};

window.onAccount = function (e) {
  console.log('Account:', e);
  logout();
};

window.goBack = function (event) {
  eventHandled(event);
  window.history.back();
};

window.goHome = function (event) {
  eventHandled(event);
  window.open('/', '_self');
};

function showAppName(currentUrl) {
  const appNameDiv = document.getElementById('appName');
  const appLinkDiv = document.getElementById('appLink');
  const goBackDiv = document.getElementById('goBack');

  const appNames = ['viewer', 'muuntaja', 'edit', 'artikkelit'];
  const appName = new URL(currentUrl).pathname.split('/').slice(1, 2)[0];

  appNames.includes(appName)
    ? (
      appLinkDiv.style.display = 'flex',
      goBackDiv.style.display = 'none'
    )
    : (
      appLinkDiv.style.display = 'none',
      goBackDiv.classList.add('show')
    )

}
