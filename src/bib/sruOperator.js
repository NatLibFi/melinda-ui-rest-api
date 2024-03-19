/*******************************************************************************/
/*                                                                             */
/* SRU OPERATOR                                                                */
/*                                                                             */
/*******************************************************************************/

import createClient from '@natlibfi/sru-client';
import {MARCXML} from '@natlibfi/marc-record-serializers';
import {noValidation} from '../marcUtils/marcUtils';
import {Error as SruError, parseBoolean} from '@natlibfi/melinda-commons';


export function createSruOperator({sruUrl, recordSchema}) {
  const client = createClient({
    url: sruUrl,
    recordSchema, // Resp = xml
    retrieveAll: false,
    maxRecordsPerRequest: 100
  });

  return {getRecordById, getRecordByIsbn, getRecordByIssn, getRecordByTitle};

  async function getRecordById(id, collectionQueryParams = false, additionalQueryParams = false) {
    const collectionParams = handleCollectionQueryParams(collectionQueryParams);
    const additionalParams = handleAdditionalQueryParams(additionalQueryParams);

    const searchUrl = `rec.id=${id}${collectionParams}${additionalParams ? `&${additionalParams}` : ''}`;

    const records = await search(searchUrl);
    return records;
  }

  async function getRecordByIsbn(isbn, collectionQueryParams = false, additionalQueryParams = false) {
    const collectionParams = handleCollectionQueryParams(collectionQueryParams);
    const additionalParams = handleAdditionalQueryParams(additionalQueryParams);

    const searchUrl = `bath.isbn=${isbn}${collectionParams}${additionalParams ? `&${additionalParams}` : ''}`;

    const records = await search(searchUrl);
    return records;
  }

  async function getRecordByIssn(issn, collectionQueryParams = false, additionalQueryParams = false) {
    const collectionParams = handleCollectionQueryParams(collectionQueryParams);
    const additionalParams = handleAdditionalQueryParams(additionalQueryParams);

    const searchUrl = `bath.issn=${issn}${collectionParams}${additionalParams ? `&${additionalParams}` : ''}`;

    const records = await search(searchUrl);
    return records;
  }

  async function getRecordByTitle(title, collectionQueryParams = false, additionalQueryParams = false) {
    const collectionParams = handleCollectionQueryParams(collectionQueryParams);
    const additionalParams = handleAdditionalQueryParams(additionalQueryParams);

    const searchUrl = `title=${title}${collectionParams}${additionalParams ? `&${additionalParams}` : ''}`;

    const records = await search(searchUrl);
    return records;
  }

  /*******************************************************************************/
  /* Search and retrieve                                                         */

  function search(query, one = false) {

    return new Promise((resolve, reject) => {
      const promises = [];

      client.searchRetrieve(query)
        .on('record', xmlString => {
          // eslint-disable-next-line functional/immutable-data
          promises.push(MARCXML.from(xmlString, noValidation));
        })
        .on('end', async () => {
          try {

            if (promises.length > 0) {

              if (one) {
                const [firstPromise] = promises;
                const firstRecord = await firstPromise;
                return resolve(firstRecord);
              }

              const records = await Promise.all(promises);
              return resolve(records);
            }
            reject(new SruError(404, 'No records found with search and retrieve'));

          } catch (error) {
            reject(error);
          }
        })
        .on('error', error => {
          reject(error);
        });
    });
  }

  /*******************************************************************************/
  /* Helper function for handling search parameters for collection               */

  function handleCollectionQueryParams(collectionQueryParams) {
    const artoSearchParameter = 'melinda.collection=arto';
    const fennicaSearchParameter = 'melinda.authenticationcode=finb';

    if (parseBoolean(collectionQueryParams.melinda)) {
      return '';
    }

    if (parseBoolean(collectionQueryParams.arto) && parseBoolean(collectionQueryParams.fennica)) {
      return ` AND (${artoSearchParameter} OR ${fennicaSearchParameter})`;
    }

    if (parseBoolean(collectionQueryParams.arto)) {
      return ` AND ${artoSearchParameter}`;
    }

    if (parseBoolean(collectionQueryParams.fennica)) {
      return ` AND ${fennicaSearchParameter}`;
    }

    return '';
  }

  /*******************************************************************************/
  /* Helper function for handling any other search parameters                    */

  function handleAdditionalQueryParams(additionalQueryParams) {

    if (Object.keys(additionalQueryParams).length === 0) {
      return '';
    }

    const urlSearchParamObject = new URLSearchParams(additionalQueryParams);
    return urlSearchParamObject.toString();
  }

}
