//*****************************************************************************
//
// Authentication to REST services
//
//*****************************************************************************

import { authGetBaseToken, authVerify, authLogin, authLogout } from './rest.js';
import { reload, resetForms, showNotification, showTab } from './ui-utils.js';
import { startProcess, stopProcess } from './ui-utils.js';
import { getCookie, clearCookies } from './cookieService.js';

//*****************************************************************************
//
// stored auth token
//
//*****************************************************************************

//use cookies for data storage
/**
 * Expected userdata has name and token, see authRoute
 */
export const Account = {
  cookieNameForUserName: 'melinda-user-name',
  //Data set/get
  get() {
    return {
      Name: getCookie(this.cookieNameForUserName)
    }
  },
  getToken() {
    const user = this.get();
    if (!user) {
      return null;
    }

    return user.Token;
  },
  remove() {
    clearCookies([
      this.cookieNameForUserName
    ]);
  },

  //actions for account
  verify() {
    // return new Promise((resolve, reject) => {
    //   const token = this.getToken();
    //   if (token) {
    //     return resolve(authVerify(this.getToken()));
    //   }
    //   const message = 'Token was not available. Skip verify, request login';
    //   console.warn(message);
    //   return reject(new Error(message));
    // });
    return authVerify();
  },
  async login(username, password) {
    try {
      //const localToken = createBasicLocalToken(username, password);
      const baseToken = await authGetBaseToken({username: username, password: password});
      const response = await authLogin(baseToken);

      const cookieUser = this.get();
      return cookieUser
    } catch (error) {
      console.log('issue in login process', error);
      throw undefined;
    }
    // const token = createBasicToken(username, password);

    // const user = await authLogin(token);
    // // if (user) {
    // //     //console.log("Storing user", user);
    // //     this.set(user);
    // // }
    // //console.log(user);
    // //console.log(this.get());
    // //return user;

    // const cookieUser = this.get();
    // //console.log(user);
    // //console.log(cookieUser);
    // //console.log('Are tokens same: ', user.Token === cookieUser.Token);
    // return cookieUser;

    // function createBasicLocalToken(username, password = '') {
    //   //const encoded = Buffer.from(`${username}:${password}`).toString('base64');
    //   const encoded = btoa(`${username}:${password}`);
    //   return `Basic ${encoded}`;
    // }
  },
  async logout() {
    //this.remove();
    //Logout should remove relevant tokens from server side (httpOnly: true)
    try {
      await authLogout();
      console.log('Logout success');
    } catch (error) {
      console.warn(error);
    }

    //just in case clear local ? (cookies are already cleared if logout was success)
    //this.remove();
  }
};


//*****************************************************************************
//
// Login & logout
//
//*****************************************************************************

export function doLogin(onSuccess) {

  window.login = function (e) {
    eventHandled(e);

    logininfo('');

    const termschecked = document.querySelector('#login #acceptterms').checked;
    if (!termschecked) {
      logininfo('Tietosuojaselosteen ja evästeiden käytön hyväksyminen vaaditaan');
      return;
    }

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    startProcess();

    Account.login(username, password)
      .then((user) => { console.log('Login Success'); onSuccess(user); })
      .catch(err => {
        console.log(err);
        Account.remove();
        logininfo('Käyttäjätunnus tai salasana on väärin');
      })
      .finally(stopProcess);
    function logininfo(msg) {
      const infodiv = document.querySelector('#login #info');
      infodiv.innerHTML = msg;
    }
  };

  Account.verify()
    .then(response => {
      console.log('Verify has success');
      onSuccess(Account.get());
    })
    .catch(noAuth);

  function noAuth() {
    console.log('Auth failed. Clear local data and require relogin.');
    Account.remove();
    resetForms(document.getElementById('root'));
    showTab('login');
  }
}

export async function logout(e) {
  await Account.logout();
  reload();
}
