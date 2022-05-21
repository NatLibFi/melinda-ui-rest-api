//*****************************************************************************
//
// Authentication to REST services
//
//*****************************************************************************

import {authVerify, authRequest} from "./rest.js";

//-----------------------------------------------------------------------------
// stored auth token
//-----------------------------------------------------------------------------

export const Account = {
  storage: window.sessionStorage,
  name: 'melinda-user',
  
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

  verify() {
    return authVerify(this.getToken())
  },

  login(username, password) {
    function createToken(username, password = '') {
      //const encoded = Buffer.from(`${username}:${password}`).toString('base64');
      const encoded = btoa(`${username}:${password}`);
      return `Basic ${encoded}`;
    }

    const token = createToken(username, password);
    return authRequest(token).then(user => {
      if (user) this.set(user);
      return user;
    })
  },

  logout() {
    this.remove()
  }
};
