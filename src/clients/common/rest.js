//*****************************************************************************
//
// Rest calls for UI
//
//*****************************************************************************

import {getOntologyOptions} from '../artikkelit/utils.js';
import {Account} from '../common/auth.js';

//-----------------------------------------------------------------------------
const RESTurl = `${window.location.protocol}//${window.location.host}/rest`;

//console.log(`REST: ${RESTurl}`);

//*****************************************************************************
// Authentication
//*****************************************************************************

export function authRequest(token) {
  return doAuthRequest(token).then(response => response.json());
}

export function authVerify(token) {
  return doAuthRequest(token, 'verify');
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
      if (!response.ok) {
        throw undefined;
      }
      return response;
    });
}


//*****************************************************************************
// Do rest call
//*****************************************************************************

async function doRestCall({url = undefined, method = undefined, body = undefined, contentType = undefined, resultAsJson = false}) {

  const headers = {
    'Accept': 'application/json',
    'Authorization': Account.getToken(),
    ...contentType ? {'Content-Type': contentType} : {}
  };

  const result = await fetch(
    url,
    {
      method: method,
      headers: headers,
      ...body ? {body: body} : {}
    }
  );

  if (resultAsJson) {
    return result.json();
  }

  return result;
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
  );
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
  );
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
  );
}

//*****************************************************************************
// PUBLICATIONS, ARTICLES AND ONTOLOGY WORDS (artikkelit)
//*****************************************************************************

export function getPublicationByISSN(issn, type = 'journal') {
  const url = `${RESTurl}/bib/issn/${issn}?arto=1&type=${type}`;
  return doRestCall({url: url, method: 'GET', resultAsJson: true});
}

export function getPublicationByISBN(isbn, type = 'journal') {
  const url = `${RESTurl}/bib/isbn/${isbn}?arto=1&type=${type}`;
  return doRestCall({url: url, method: 'GET', resultAsJson: true});
}

export function getPublicationByMelinda(melindaId, type = 'journal') {
  const url = `${RESTurl}/bib/${melindaId}?arto=1&type=${type}`;
  return doRestCall({url: url, method: 'GET', resultAsJson: true});
}

export function getPublicationByTitle(title, type = 'journal') {
  const url = `${RESTurl}/bib/title/${title}?arto=1&type=${type}`;
  return doRestCall({url: url, method: 'GET', resultAsJson: true});
}

export function getBookForReviewByTitle(title) {
  const url = `${RESTurl}/bib/title/${title}?reviewSearch=1&type=book`;
  return doRestCall({url: url, method: 'GET', resultAsJson: true});
}

export function getArtikkeliRecord(data) {
  const url = `${RESTurl}/artikkelit/`;
  const body = JSON.stringify(data);
  return doRestCall({url: url, method: 'POST', body: body, resultAsJson: true});
}

export function getOntologyWords(ontology, query) {
  const {searchVocab, language} = getOntologyOptions(ontology);
  const url = `${RESTurl}/ontologies/${language}/${searchVocab}/${query}`;
  return doRestCall({url: url, method: 'GET', resultAsJson: true});
}


//*****************************************************************************
// LOGS (viewer)
//*****************************************************************************

export function getMatchLog(id, sequence) {
  const url = `${RESTurl}/viewer/match-log/${id}${sequence ? `?sequence=${sequence}` : ''}`;
  return doRestCall({url: url, method: 'GET', resultAsJson: true});
}

export function getMatchValidationLog(id, sequence) {
  const url = `${RESTurl}/viewer/match-validation-log/${id}${sequence ? `?sequence=${sequence}` : ''}`;
  return doRestCall({url: url, method: 'GET', resultAsJson: true});
}

export function getMergeLog(id, sequence) {
  const url = `${RESTurl}/viewer/merge-log/${id}${sequence ? `?sequence=${sequence}` : ''}`;
  return doRestCall({url: url, method: 'GET', resultAsJson: true});
}

export function getCorrelationIdList(expanded) {
  const url = `${RESTurl}/viewer/correlation-id-list${expanded ? `?expanded=${expanded}` : `?expanded=0`}`;
  return doRestCall({url: url, method: 'GET', resultAsJson: true});
}

export function protectLog(id, sequence) {
  const url = `${RESTurl}/viewer/protect/${id}${sequence ? `?sequence=${sequence}` : ''}`;
  return doRestCall({url: url, method: 'PUT'});
}

export function removeLog(id, force) {
  const url = `${RESTurl}/viewer/remove/${id}${force ? `?force=${force}` : ''}`;
  return doRestCall({url: url, method: 'DELETE'});
}


//*****************************************************************************
