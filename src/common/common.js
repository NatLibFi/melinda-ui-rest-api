// Common functions for REST UI services
import * as config from '../config';
import createClient from '@natlibfi/sru-client';
import {MARCXML} from '@natlibfi/marc-record-serializers';

/*
function readRecord(client, recordId) {
  return new Promise((resolve, reject) => {
    client.read(recordId).then(({record}) => {
      logger.log('http', 'Record reading success');
      logger.log('silly', `Record: ${JSON.stringify({record})}`);
      resolve(record);
    }).catch(error => {
      logger.log('debug', 'Record loading error');
      reject(error);
    });
  });
}
*/

export function getRecordByID(id) {
  const client = createClient({
    url: config.sruUrl,
    recordSchema: 'marcxml', // Resp = xml
    //recordSchema: 'marc', // Resp = error
    retrieveAll: false
    //maxRecordsPerRequest: 1
  });

  //let recordPromise; // eslint-disable-line

  return new Promise((resolve, reject) => client.searchRetrieve(`rec.id=${id}`)
    .on('record', record => resolve(MARCXML.from(record, {subfieldValues: false})))
  //.on('end', () => endProcessing())
    .on('error', err => reject(err)));

  /*
  function processRecord(data) {
    //logger.debug(`Process record ${data}`);
    recordPromise = MARCXML.from(data, {subfieldValues: false});
  }

  // https://github.com/NatLibFi/melinda-rest-api-http/blob/0252517d2184f6cddd07ed44bf0a42dbf0d5eb21/src/interfaces/prio.js#L165

  function endProcessing() {
    //logger.debug('End Processing');
    //logger.debug(`record Promise ${recordPromise}`);
    Promise.resolve(recordPromise).then(result => result.toObject());
    //Promise.resolve(recordPromise).then(result => {
    //logger.debug(`Got result ${result}`);
    //res.json(result.toObject());
    //});
  }

  function handleError(err) { // eslint-disable-line
    //logger.error(`handleError ${err}`);
    // https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
    // https://www.npmjs.com/package/http-status
    //next(new APIError(404, 'errori tuli'));
  }
  */
}
