//*****************************************************************************
//
// Rest calls for UI
//
//*****************************************************************************

import {getAuthToken} from "../common/auth.js"

//-----------------------------------------------------------------------------

export const RESTurl = window.location.protocol + "//" + window.location.host + "/rest";

console.log(`REST: ${RESTurl}`);

//-----------------------------------------------------------------------------

export function authRequest(token, url = '') {
  return fetch(
    `${RESTurl}/auth/${url}`,
    {
      method: 'POST',
      headers: {
        Authorization: token
      }
    }
  );
}

//-----------------------------------------------------------------------------

export function profileRequest() {
  return fetch(
    `${RESTurl}/muuntaja/profiles`,
    {
      method: 'GET',
      headers: {
        Authorization: getAuthToken()
      }
    }
  );
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
        Authorization: getAuthToken()
      },
      body: JSON.stringify(transformed)
    }
  )
}
