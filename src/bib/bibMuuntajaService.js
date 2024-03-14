/*******************************************************************************/
/*                                                                             */
/* BIB SERVICE                                                                 */
/*                                                                             */
/*******************************************************************************/

import {createSruOperator} from './sruOperator';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {createMelindaApiRecordClient} from '@natlibfi/melinda-rest-api-client';

/* eslint-disable no-unused-vars */

export function createBibMuuntajaService(sruUrl, melindaApiOptions) {
  const logger = createLogger();
  const sruOperator = createSruOperator({sruUrl, recordSchema: 'marcxml'});
  const melindaRestApiClient = createMelindaApiRecordClient(melindaApiOptions);

  return {getRecordById, createOne, updateOne};

  async function getRecordById(id, typeParam, collectionQueryParams, additionalQueryParams) {

    try {
      const records = await sruOperator.getRecordById(id, collectionQueryParams, additionalQueryParams);
      return records;
    } catch (err) {
      logger.error(`getRecordById: ${JSON.stringify(err)}`);
      return [
        {
          ID: id,
          status: err?.stats,
          error: err?.payload ?? err.toString()
        }
      ];
    }
  }

  function getError(response) {
    if (response.status === 'ERROR') {
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

  async function createOne(record, cataloger, restApiParams) { // eslint-disable-line no-unused-vars

    //logger.debug(`createOne: cataloger=${cataloger}`);

    if (!cataloger) {
      throw new Error('Invalid parameter: cataloger');
    }

    const params = {
      unique: restApiParams.unique,
      merge: restApiParams.merge,
      noop: 0,
      cataloger
    };

    //const response = await melindaRestApiClient.create(record, params);
    const response = {
      databaseId: '017735845'
    };

    //logger.debug(response.status);
    logger.debug(`Create response= ${JSON.stringify(response, null, 2)}`);

    const createdRecord = await melindaRestApiClient.read(response.databaseId);
    //const createdRecord = {record};
    //logger.debug(`Create record: ${JSON.stringify(createdRecord)}`);

    return {
      ID: response.databaseId,
      //status: response.recordStatus,
      //detailedStatus: response.detailedRecordStatus,
      ...getError(response),
      leader: createdRecord.record.leader,
      fields: createdRecord.record.fields
    };
  }

  async function updateOne(recordId, record, cataloger, restApiParams) { // eslint-disable-line no-unused-vars
    if (!recordId || !cataloger) {
      throw new Error(`invalid parameters:${cataloger ? '' : ' cataloger'}${recordId ? '' : ' recordId'}`);
    }

    const params = {
      ...restApiParams,
      noop: 0, //restApiParams.noop,
      cataloger
    };

    const response = await melindaRestApiClient.update(record, recordId, params);

    logger.debug(`Update response: ${JSON.stringify(response)}`);

    const updatedRecord = await melindaRestApiClient.read(recordId);

    //logger.debug(`Updated record: ${JSON.stringify(updatedRecord)}`);

    return {
      ID: response.databaseId,
      //status: response.recordStatus,
      //detailedStatus: response.detailedRecordStatus,
      ...getError(response),
      leader: updatedRecord.record.leader,
      fields: updatedRecord.record.fields
    };
  }
}
