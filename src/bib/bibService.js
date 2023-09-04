// Common functions for REST UI services
import {collectData} from './artoDataCollector';
import {createSruOperator} from './sruOperator';
import {parseBoolean} from '@natlibfi/melinda-commons';
import {checkRecordType} from './collectorUtils';

export function createBibService(sruUrl) {
  const sruOperator = createSruOperator({sruUrl, recordSchema: 'marcxml'});

  return {getRecordByTitle, getRecordByIssn, getRecordByIsbn, getRecordByID};

  async function getRecordByTitle(title, typeParam, collectionQueryParams, additionalQueryParams) {
    const records = await sruOperator.getRecordByTitle(title, collectionQueryParams, additionalQueryParams);

    return records
      .filter(record => checkRecordType(typeParam, record))
      .map(record => ({leader: record.leader, fields: record.fields, data: collectData(record)}));
  }

  async function getRecordByIssn(issn, additionalQueryParams) {
    const record = await sruOperator.getRecordByIssn(issn, additionalQueryParams);
    if (parseBoolean(additionalQueryParams.arto)) {
      return {leader: record.leader, fields: record.fields, data: collectData(record)};
    }
    return record;
  }

  async function getRecordByIsbn(isbn, additionalQueryParams) {
    const record = await sruOperator.getRecordByIsbn(isbn, additionalQueryParams);
    if (parseBoolean(additionalQueryParams.arto)) {
      return {leader: record.leader, fields: record.fields, data: collectData(record)};
    }
    return record;
  }

  async function getRecordByID(id, additionalQueryParams) {
    const record = await sruOperator.getRecordByID(id, additionalQueryParams);
    if (parseBoolean(additionalQueryParams?.arto)) {
      return {leader: record.leader, fields: record.fields, data: collectData(record)};
    }
    return {ID: id, ...record};

    /*
      const result = await client.searchRetrieve(`rec.id=${id}`)
      .on('record', record => MARCXML.from(record, {subfieldValues: false}))
        .on('end', () => resultRecord)
        .on('error', err => err);

        return result;
        */

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
}
