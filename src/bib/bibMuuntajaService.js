/*******************************************************************************/
/*                                                                             */
/* BIB SERVICE                                                                 */
/*                                                                             */
/*******************************************************************************/

import {createSruOperator} from './sruOperator';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {createMelindaApiRecordClient} from '@natlibfi/melinda-rest-api-client';

/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */

export function createBibMuuntajaService(sruUrl, melindaApiOptions) {
  const logger = createLogger();
  const sruOperator = createSruOperator({sruUrl, recordSchema: 'marcxml'});
  const melindaRestApiClient = createMelindaApiRecordClient(melindaApiOptions);

  return {getRecordById, createOne, updateOne, getUpdated};

  async function getRecordById(recordId, typeParam, collectionQueryParams, additionalQueryParams) {

    try {
      const [record] = await sruOperator.getRecordById(recordId, collectionQueryParams, additionalQueryParams);
      return record;
    } catch (err) {
      logger.error(`getRecordById: ${JSON.stringify(err)}`);
      return {
        ID: recordId,
        status: err?.stats,
        error: err?.payload ?? err.toString()
      };
    }
  }

  function getError(response) {
    if (response.status === 'ERROR' || response.recordStatus === 'ERROR') {
      return {
        error: response.message
      };
    }
    if (response.message) {
      return {
        notes: response.message
      };
    }
    return {};
  }

  async function createOne(record, cataloger, restApiParams) { // eslint-disable-line require-await

    if (!cataloger) {
      throw new Error('Invalid parameter: cataloger');
    }

    const params = {
      merge: 0, // restApiParams.merge,
      unique: 0, // restApiParams.unique,
      noop: 0,
      cataloger
    };

    logger.debug(`createOne params: ${JSON.stringify(params, null, 2)}`);
    logger.debug(`createOne record: ${JSON.stringify(record, null, 2)}`);

    //*
    return {
      ID: '017735845',
      notes: 'Found 0 matching records in the database. - Created record 017735845.'
    };

    /*/

    const response = await melindaRestApiClient.create(record, params);
    //const response = ;

    //logger.debug(response.status);
    logger.debug(`Create response= ${JSON.stringify(response, null, 2)}`);

    //const createdRecord = await melindaRestApiClient.read(response.databaseId);
    //const createdRecord = {record};
    //logger.debug(`Create record: ${JSON.stringify(createdRecord)}`);

    return {
      ID: response.databaseId,
      //status: response.recordStatus,
      //detailedStatus: response.detailedRecordStatus,
      ...getError(response)
    };
    /**/
  }

  async function updateOne(recordId, record, cataloger, restApiParams) { // eslint-disable-line no-unused-vars
    if (!recordId || !cataloger) {
      throw new Error(`invalid parameters:${cataloger ? '' : ' cataloger'}${recordId ? '' : ' recordId'}`);
    }

    const params = {
      noop: 0, //restApiParams.noop,
      cataloger
    };

    logger.debug(`updateOne params: ${JSON.stringify(params, null, 2)}`);
    logger.debug(`updateOne record: ${JSON.stringify(record, null, 2)}`);

    const response = await melindaRestApiClient.update(record, recordId, params);

    logger.debug(`Update response: ${JSON.stringify(response)}`);

    //const updatedRecord = await melindaRestApiClient.read(recordId);

    //logger.debug(`Updated record: ${JSON.stringify(updatedRecord)}`);

    return {
      ID: response.databaseId,
      //status: response.recordStatus,
      //detailedStatus: response.detailedRecordStatus,
      ...getError(response)
    };
  }

  async function getUpdated(recordId) {
    const updatedRecord = await melindaRestApiClient.read(recordId);
    return updatedRecord.record;
  }
}
