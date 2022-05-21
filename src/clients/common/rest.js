//*****************************************************************************
//
// Rest calls for UI
//
//*****************************************************************************

import {Account} from "../common/auth.js"

//-----------------------------------------------------------------------------

const RESTurl = window.location.protocol + "//" + window.location.host + "/rest";

//console.log(`REST: ${RESTurl}`);

//*****************************************************************************
// Authentication
//*****************************************************************************

export function authRequest(token) {
  return doAuthRequest(token).then(response => response.json())
}

export function authVerify(token) {
  return doAuthRequest(token, 'verify')
}

function doAuthRequest(token, url = '') {
  return fetch(
    `${RESTurl}/auth/${url}`,
    {
      method: 'POST',
      headers: {
        Authorization: token
      }
    }
  )
  .then(response => {
    if (!response.ok) throw undefined;
    return response;
  });
}

//*****************************************************************************
// Transformations
//*****************************************************************************

export function profileRequest() {
  return fetch(
    `${RESTurl}/muuntaja/profiles`,
    {
      method: 'GET',
      headers: {
        Authorization: Account.getToken()
      }
    }
  )
  .then(response => response.json());
}

//-----------------------------------------------------------------------------

export function transformRequest(transformed) {
  return fetch(
    `${RESTurl}/muuntaja/transform`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: Account.getToken()
      },
      body: JSON.stringify(transformed)
    }
  )
}
