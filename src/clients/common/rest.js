//*****************************************************************************
//
// Rest calls for UI
//
//*****************************************************************************

import { getOntologyOptions } from '../artikkelit/utils/utils.js';
import { Account } from '../common/auth.js';


//*****************************************************************************
// REST URL
//*****************************************************************************

const RESTurl = `${window.location.protocol}//${window.location.host}/rest`;


//*****************************************************************************
// AUTHENTICATION
//*****************************************************************************

export function authLogin(token) {
  return doAuthRequest({ token, url: 'login' }).then(response => response.json());;
}
export async function authGetBaseToken(body) {
  try {
    const response = await doAuthRequest({ url: 'getBaseToken', body });
    const data = await response.json();
    const token = data.token;
    return token;
  } catch (error) {
    console.error('Issue with auth getting base token', error);
  }
}
export function authVerify() {
  return doAuthRequest({ url: 'verify', method: 'GET' }).then(response => response.json());;
}
export function authLogout() {
  return doAuthRequest({ url: 'logout' });
}

async function doAuthRequest({ url = '', method = 'POST', token = undefined, body = undefined }) {
  const requestUrl = `${RESTurl}/auth/${url}`;
  const requestConfig = {
    method: method.toUpperCase(),
    headers: {},
    credentials: 'include',
    cache: 'no-store'
  };

  //exception configs
  setAuthHeaders();

  if (body) {
    requestConfig.headers['Accept'] = 'application/json';
    requestConfig.headers['Content-Type'] = 'application/json';
    requestConfig.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(requestUrl, requestConfig);
    if (!response.ok) {
      throw undefined;
    }
    return response;
  } catch (error) {
    warnAndAbort('Auht not ok');
  }

  function setAuthHeaders() {
    if (token) {
      requestConfig.headers['Authorization'] = token;
      return;
    }

    requestConfig.headers['Access-Control-Allow-Credentials'] = true;
    requestConfig.headers['Access-Control-Allow-Headers'] = ['Origin', 'Content-Type', 'Accept', 'Authorization', 'Set-Cookie'];
  }
  function warnAndAbort(message) {
    console.warn(message);
    throw undefined;
  };
}


//*****************************************************************************
// FETCH FROM REST
//*****************************************************************************

async function doRestCall({ url = undefined, method = undefined, body = undefined, contentType = undefined, resultAsJson = false }) {

  const headers = {
    'Accept': 'application/json',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': ['Origin', 'Content-Type', 'Accept', 'Authorization', 'Set-Cookie'],
    ...contentType ? { 'Content-Type': contentType } : {}
  };

  const result = await fetch(
    url,
    {
      method: method,
      headers: headers,
      ...body ? { body: body } : {}
    }
  );

  if (resultAsJson) {
    return result.json();
  }

  return result;
}


//*****************************************************************************
// RECORDS AND TRANSFORMATIONS (muuntaja)
//*****************************************************************************

export function getRecord(id) {
  const url = `${RESTurl}/bib/${id}`;
  return doRestCall({ url: url, method: 'GET' });
}

export function modifyRecord(transforming) {
  const url = `${RESTurl}/record/modify`;
  const body = JSON.stringify(transforming);
  return doRestCall({ url: url, method: 'POST', contentType: 'application/json', body: body });
}

export function profileRequest() {
  const url = `${RESTurl}/muuntaja/profiles`;
  return doRestCall({ url: url, method: 'GET', resultAsJson: true });
}

export function transformRequest(transformed) {
  const url = `${RESTurl}/muuntaja/transform`;
  const body = JSON.stringify(transformed);
  return doRestCall({ url: url, method: 'POST', contentType: 'application/json', body: body });
}

export function storeTransformedRequest(transformed) {
  const url = `${RESTurl}/muuntaja/store`;
  const body = JSON.stringify(transformed);
  return doRestCall({ url: url, method: 'POST', contentType: 'application/json', body: body });
}

//*****************************************************************************
// PUBLICATIONS, ARTICLES AND ONTOLOGY WORDS (artikkelit)
//*****************************************************************************

export function getPublicationByISSN(issn, { arto, fennica, melinda }, type = 'journal') {
  const url = `${RESTurl}/bib/issn/${issn}?arto=${arto ? 1 : 0}&fennica=${fennica ? 1 : 0}&melinda=${melinda ? 1 : 0}&type=${type}`;
  return doRestCall({ url: url, method: 'GET', resultAsJson: true });
}

export function getPublicationByISBN(isbn, { arto, fennica, melinda }, type = 'journal') {
  const url = `${RESTurl}/bib/isbn/${isbn}?arto=${arto ? 1 : 0}&fennica=${fennica ? 1 : 0}&melinda=${melinda ? 1 : 0}&type=${type}`;
  return doRestCall({ url: url, method: 'GET', resultAsJson: true });
}

export function getPublicationByMelindaId(melindaId, { arto, fennica, melinda }, type = 'journal') {
  const url = `${RESTurl}/bib/${melindaId}?arto=${arto ? 1 : 0}&fennica=${fennica ? 1 : 0}&melinda=${melinda ? 1 : 0}&type=${type}`;
  return doRestCall({ url: url, method: 'GET', resultAsJson: true });
}

export function getPublicationByTitle(title, { arto, fennica, melinda }, type = 'journal') {
  const url = `${RESTurl}/bib/title/${title}?arto=${arto ? 1 : 0}&fennica=${fennica ? 1 : 0}&melinda=${melinda ? 1 : 0}&type=${type}`;
  return doRestCall({ url: url, method: 'GET', resultAsJson: true });
}

export function generateArticleRecord(data) {
  const url = `${RESTurl}/artikkelit/`;
  const body = JSON.stringify(data);
  return doRestCall({ url: url, method: 'POST', body: body, resultAsJson: true });
}

export function getOntologyWords(ontology, query) {
  const { searchVocab, language } = getOntologyOptions(ontology);
  const url = `${RESTurl}/ontologies/${language}/${searchVocab}/${query}`;
  return doRestCall({ url: url, method: 'GET', resultAsJson: true });
}


//*****************************************************************************
// RECORDS (artikkelit)
//*****************************************************************************

export function addArticleRecord(data) {
  const url = `${RESTurl}/record/add/`;
  const body = JSON.stringify(data);
  return doRestCall({ url: url, method: 'POST', body: body, contentType: 'application/json', resultAsJson: false });
}

export function validateArticleRecord(data) {
  const url = `${RESTurl}/record/validate/`;
  const body = JSON.stringify(data);
  return doRestCall({ url: url, method: 'POST', body: body, contentType: 'application/json', resultAsJson: false });
}


//*****************************************************************************
// LOGS (viewer)
//*****************************************************************************

export function getMatchLog(id, sequence) {
  const url = `${RESTurl}/viewer/match-log/${id}${sequence ? `?sequence=${sequence}` : ''}`;
  return doRestCall({ url: url, method: 'GET', resultAsJson: true });
}

export function getMatchValidationLog(id, sequence) {
  const url = `${RESTurl}/viewer/match-validation-log/${id}${sequence ? `?sequence=${sequence}` : ''}`;
  return doRestCall({ url: url, method: 'GET', resultAsJson: true });
}

export function getMergeLog(id, sequence) {
  const url = `${RESTurl}/viewer/merge-log/${id}${sequence ? `?sequence=${sequence}` : ''}`;
  return doRestCall({ url: url, method: 'GET', resultAsJson: true });
}

export function getCorrelationIdList(expanded, logItemTypes) {
  const url = `${RESTurl}/viewer/correlation-id-list${expanded ? `?expanded=${expanded}` : `?expanded=0`}${logItemTypes ? `&logItemTypes=${logItemTypes}` : ``}`;
  return doRestCall({ url: url, method: 'GET', resultAsJson: true });
}

export function protectLog(id, sequence) {
  const url = `${RESTurl}/viewer/protect/${id}${sequence ? `?sequence=${sequence}` : ''}`;
  return doRestCall({ url: url, method: 'PUT' });
}

export function removeLog(id, force) {
  const url = `${RESTurl}/viewer/remove/${id}${force ? `?force=${force}` : ''}`;
  return doRestCall({ url: url, method: 'DELETE' });
}


//*****************************************************************************
// Notifications
//*****************************************************************************

export function getServerNotifications(client) {
  const url = `${RESTurl}/notification/${client}`;
  return doRestCall({ url: url, method: 'GET', resultAsJson: true });
}