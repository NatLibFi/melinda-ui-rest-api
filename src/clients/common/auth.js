//*****************************************************************************
//
// Authentication to REST services
//
//*****************************************************************************

import { authGetBaseToken, authVerify, authLogin, authLogout } from './rest.js';
import { reload, resetForms, showNotification, showTab } from './ui-utils.js';
import { startProcess, stopProcess } from './ui-utils.js';

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
  data: {},
  defaultData: { name: 'melinda-user' },
  get() {
    return this.data
  },
  update(updateData) { this.data = updateData; },
  reset() { this.data = JSON.parse(JSON.stringify(this.defaultData)); },
  remove() { this.reset(); },

  //actions for account
  verify() {
    return authVerify();
  },
  async login(username, password) {
    try {
      //const localToken = createBasicLocalToken(username, password);
      const baseToken = await authGetBaseToken({ username: username, password: password });
      const userData = await authLogin(baseToken);

      return userData;
    } catch (error) {
      console.log('issue in login process', error);
      throw undefined;
    }
  },
  async logout() {
    //Logout should remove relevant tokens from server side (httpOnly: true)
    try {
      await authLogout();
      this.remove();
      console.log('Logout success');
    } catch (error) {
      console.warn(error);
    }
  }
};
Account.reset();


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
      .then((user) => {
        console.log('Login Success');
        Account.update(user);
        onSuccess(user);
      })
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
    .then(userData => {
      console.log('Verify has success');
      Account.update(userData);
      onSuccess();
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
