/*******************************************************************************/
/*                                                                             */
/* BIB SERVICE                                                                 */
/*                                                                             */
/*******************************************************************************/

import {createSruOperator} from './sruOperator';
import {checkRecordType} from './collectorUtils';
import {collectData} from './artoDataCollector';

export function createBibService(sruUrl) {
  const sruOperator = createSruOperator({sruUrl, recordSchema: 'marcxml'});

  return {getRecordById, getRecordByIsbn, getRecordByIssn, getRecordByTitle};

  async function getRecordById(id, typeParam, collectionQueryParams, additionalQueryParams) {
    const records = await sruOperator.getRecordById(id, collectionQueryParams, additionalQueryParams);

    return records
      .filter(record => checkRecordType(typeParam, record))
      .map(record => ({leader: record.leader, fields: record.fields, data: collectData(record)}));
  }

  async function getRecordByIsbn(isbn, typeParam, collectionQueryParams, additionalQueryParams) {
    const records = await sruOperator.getRecordByIsbn(isbn, collectionQueryParams, additionalQueryParams);

    return records
      .filter(record => checkRecordType(typeParam, record))
      .map(record => ({leader: record.leader, fields: record.fields, data: collectData(record)}));
  }

  async function getRecordByIssn(issn, typeParam, collectionQueryParams, additionalQueryParams) {
    const records = await sruOperator.getRecordByIssn(issn, typeParam, collectionQueryParams, additionalQueryParams);

    return records
      .filter(record => checkRecordType(typeParam, record))
      .map(record => ({leader: record.leader, fields: record.fields, data: collectData(record)}));
  }

  async function getRecordByTitle(title, typeParam, collectionQueryParams, additionalQueryParams) {
    const records = await sruOperator.getRecordByTitle(title, collectionQueryParams, additionalQueryParams);

    return records
      .filter(record => checkRecordType(typeParam, record))
      .map(record => ({leader: record.leader, fields: record.fields, data: collectData(record)}));
  }

}
