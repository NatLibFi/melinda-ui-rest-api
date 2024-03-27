import {showNotification, showServerNotifications, showTab} from '/./common/ui-utils.js';
import {Account, doLogin, logout} from '/./common/auth.js';

window.initialize = function () {
  showServerNotifications({clientName: 'pageNotFound', onSuccess: ()=>{doLogin(authSuccess);}});

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

  const appNames = ['viewer', 'muuntaja', 'merge', 'edit', 'artikkelit'];
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
