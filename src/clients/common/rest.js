//*****************************************************************************
//
// Rest calls for UI
//
//*****************************************************************************

import { getOntologyOptions } from "../artikkelit/utils.js";
import { Account } from "../common/auth.js"

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
// Artikkelit (artikkelit)
//*****************************************************************************

export function getPublicationByISSN(issn, type = 'journal') {
  return fetchFromRest(`${RESTurl}/bib/issn/${issn}?arto=1&type=${type}`);
}

export function getPublicationByISBN(isbn, type = 'journal') {
  return fetchFromRest(`${RESTurl}/bib/isbn/${isbn}?arto=1&type=${type}`);
}

export function getPublicationByMelinda(melindaId, type = 'journal') {
  return fetchFromRest(`${RESTurl}/bib/${melindaId}?arto=1&type=${type}`);
}

export function getPublicationByTitle(title, type = 'journal') {
  return fetchFromRest(`${RESTurl}/bib/title/${title}?arto=1&type=${type}`);
}

export function getArtikkeliRecord(data) {
  //console.log(`body: ${data}`);
  return fetchFromRest(`${RESTurl}/artikkelit/`, 'POST', JSON.stringify(data));
}

export function getOntologyWords(ontology, query) {
  const { searchVocab, language } = getOntologyOptions(ontology)

  return fetchFromRest(`${RESTurl}/ontologies/${language}/${searchVocab}/${query}`);
}

async function fetchFromRest(url, method = 'GET', body = undefined) {
  const result = await fetch(url,
    {
      method,
      headers: {
        'Accept': 'application/json',
      },
      body
    }
  );

  if (result.ok) {
    return result.json();
  }

  return { error: { status: result.status, message: result.text() } };
}


//*****************************************************************************
// LOGS (viewer)
//*****************************************************************************

export function getMatchLog(id, sequence) {
  return fetchLogs(`${RESTurl}/viewer/match-log/${id}${sequence ? `?sequence=${sequence}` : ''}`);
}

export function getMatchValidationLog(id, sequence) {
  return fetchLogs(`${RESTurl}/viewer/match-validation-log/${id}${sequence ? `?sequence=${sequence}` : ''}`);
}

export function getMergeLog(id, sequence) {
  return fetchLogs(`${RESTurl}/viewer/merge-log/${id}${sequence ? `?sequence=${sequence}` : ''}`);
}

export function getCorrelationIdList(expanded) {
  return fetchLogs(`${RESTurl}/viewer/correlation-id-list${expanded ? `?expanded=${expanded}` : `?expanded=0`}`);
}

async function fetchLogs(url) {
  const result = await fetch(url,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        Authorization: Account.getToken()
      }
    }
  )
  return result.json();
}

//-----------------------------------------------------------------------------

export async function protectLog(id, sequence) {
  return fetch(
    `${RESTurl}/viewer/protect/${id}${sequence ? `?sequence=${sequence}` : ''}`,
    {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        Authorization: Account.getToken()
      }
    }
  )
}

//-----------------------------------------------------------------------------

export function removeLog(id, logType) {
  return fetch(
    `${RESTurl}/viewer/remove/${id}${sequence ? `?logType=${logType}` : ''}`,
    {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        Authorization: Account.getToken()
      }
    }
  )
}

//-----------------------------------------------------------------------------


//*****************************************************************************
