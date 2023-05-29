import {setNavBar, showSnackbar, showTab} from '/./common/ui-utils.js';
<<<<<<< HEAD
import {Account, doLogin, logout} from "/./common/auth.js"
=======
import {Account, doLogin, logout} from '/./common/auth.js';
>>>>>>> origin/next

window.initialize = function () {
  setNavBar(document.querySelector('#navbar'), 'Valitse sovellus');

  doLogin(authSuccess);

  function authSuccess(user) {
    showTab('pageNotFound');
    showSnackbar({text: 'Sivua ei löytynyt, tarkista sivun osoite ja yritä uudelleen!', closeButton: 'true'});
<<<<<<< HEAD
    const username = document.querySelector("#account-menu #username");
    username.innerHTML = Account.get()["Name"];
  }
}
=======
    const username = document.querySelector('#account-menu #username');
    username.innerHTML = Account.get().Name;
  }
};
>>>>>>> origin/next

window.onAccount = function (e) {
  console.log('Account:', e);
  logout();
<<<<<<< HEAD
}
=======
};
>>>>>>> origin/next

window.goBack = function (event) {
  eventHandled(event);
  window.history.back();
<<<<<<< HEAD
}
=======
};
>>>>>>> origin/next

window.goHome = function (event) {
  eventHandled(event);
  window.open('/', '_self');
<<<<<<< HEAD
}
=======
};
>>>>>>> origin/next
