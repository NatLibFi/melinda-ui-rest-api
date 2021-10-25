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
    retrieveAll: false
    //maxRecordsPerRequest: 1
  });

  /*
    const result = await client.searchRetrieve(`rec.id=${id}`)
      .on('record', record => MARCXML.from(record, {subfieldValues: false}))
      .on('end', () => resultRecord)
      .on('error', err => err);

    return result;
  */

  return new Promise((resolve, reject) => {
    let promise; // eslint-disable-line functional/no-let

    // rec.id -> foo.bar --> virhe

    client.searchRetrieve(`rec.id=${id}`)
      .on('record', xmlString => {
        promise = MARCXML.from(xmlString, {subfieldValues: false});
      })
      .on('end', async () => {
        if (promise) {
          try {
            const record = await promise;
            resolve(record);
          } catch (err) {
            reject(err);
          }
          return;
        }
        //resolve();
        reject(Error('Not found.'));
      })
      .on('error', err => reject(err));
  });

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
