import fetch from 'node-fetch';
import {URL} from 'url';
import {generateAuthorizationHeader} from '@natlibfi/melinda-commons';

export function createLogService(restApiLogClient) {

  return {getMatchLog, getMatchValidationLog, getMergeLog};

  async function getMatchLog(params) {
    const result = await restApiLogClient.getLog({logItemType: 'MATCH_LOG', ...params});
    const matchLogs = result.filter(log => log.logItemType === 'MATCH_LOG');
    return {...matchLogs};
  }

  async function getMatchValidationLog(params) {
    const result = await restApiLogClient.getLog({logItemType: 'MATCH_VALIDATION_LOG', ...params});
    const matchValidationLogs = result.filter(log => log.logItemType === 'MATCH_VALIDATION_LOG');
    return {...matchValidationLogs};
  }

  async function getMergeLog(params) {
    const result = await restApiLogClient.getLog({logItemType: 'MERGE_LOG', ...params});
    const mergeLogs = result.filter(log => log.logItemType === 'MERGE_LOG');
    return {...mergeLogs};
  }
}

export function createCorrelationIdListService({melindaApiUrl, melindaApiUsername, melindaApiPassword}) {

  return {getCorrelationIdList};

  async function getCorrelationIdList() {
    const path = 'logs/list?expanded=1';
    const url = new URL(`${melindaApiUrl}${path}`);
    const Authorization = generateAuthorizationHeader(melindaApiUsername, melindaApiPassword);
    const userAgent = 'Melinda commons API client / Javascript';
    const method = 'get';
    const contentType = 'application/json';
    const body = null;

    const options = {
      method,
      headers: {
        'User-Agent': userAgent,
        'content-type': contentType,
        Authorization,
        Accept: 'application/json'
      },
      body
    };

    const result = await fetch(url, options);

    if (result.ok) {
      return result.json();
    }

    return {
      error: {
        status: result.status,
        message: result.text()
      }
    };

  }

}
