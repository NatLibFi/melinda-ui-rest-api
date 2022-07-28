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
// Single records
//*****************************************************************************

export function getRecord(id) {
  return fetch(
    `${RESTurl}/bib/${id}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: Account.getToken()
      }
    }
  )
}

export function modifyRecord(transforming) {
  return fetch(
    `${RESTurl}/record/modify`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: Account.getToken()
      },
      body: JSON.stringify(transforming)
    }
  )
}

//*****************************************************************************
// Transformations (Muuntaja)
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

//*****************************************************************************
// LOGS (viewer)
//*****************************************************************************

export function getMatchLog(id, sequence) {
  return fetch(
    `${RESTurl}/viewer/match-log/${id}${sequence ? `/${sequence}` : ''}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        Authorization: Account.getToken()
      }
    }
  )
}

export function getMatchValidationLog(id, sequence) {
  return fetch(
    `${RESTurl}/viewer/match-validation-log/${id}${sequence ? `/${sequence}` : ''}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        Authorization: Account.getToken()
      }
    }
  )
}

export function getMergeLog(id, sequence) {
  return fetch(
    `${RESTurl}/viewer/merge-log/${id}${sequence ? `/${sequence}` : ''}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        Authorization: Account.getToken()
      }
    }
  )
}
