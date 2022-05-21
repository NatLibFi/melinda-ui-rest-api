//*****************************************************************************
//
// Authentication to REST services
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// stored auth token
//-----------------------------------------------------------------------------

export const melindaUser = {
  storage: window.sessionStorage,
  name: 'melinda-user',
  get (jsonField = this.name) {
    try {
      return JSON.parse(this.storage.getItem(jsonField));
    } catch (e) {
      return undefined;
    }
  },
  set (token) {
    return this.storage.setItem(this.name, JSON.stringify(token));
  },
  remove () {
    return this.storage.removeItem(this.name);
  }
};

export function getAuthToken() {
  const user = melindaUser.get();
  if(!user) return;
  
  return user.Token;
}

export function createToken(username, password = '') {
  //const encoded = Buffer.from(`${username}:${password}`).toString('base64');
  const encoded = btoa(`${username}:${password}`);
  return `Basic ${encoded}`;
}
