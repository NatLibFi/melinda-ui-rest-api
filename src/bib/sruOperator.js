import createClient from '@natlibfi/sru-client';
import {MARCXML} from '@natlibfi/marc-record-serializers';
import {noValidation} from '../marcUtils/marcUtils';
import {Error as SruError, parseBoolean} from '@natlibfi/melinda-commons';


export function createSruOperator({sruUrl, recordSchema}) {
  const client = createClient({
    url: sruUrl,
    recordSchema, // Resp = xml
    retrieveAll: false,
    maxRecordsPerRequest: 10
  });

  return {getRecordByTitle, getRecordByID, getRecordByIssn, getRecordByIsbn};

  async function getRecordByTitle(title, additionalQueryParams = false) {
    if (additionalQueryParams) {
      const record = await search(`title=${title}${handleAdditionalQueryParams(additionalQueryParams)}`);
      return record;
    }

    const record = await search(`rec.id=${title}`);
    return record;
  }

  async function getRecordByID(id, additionalQueryParams = false) {
    if (additionalQueryParams) {
      const record = await search(`rec.id=${id}${handleAdditionalQueryParams(additionalQueryParams)}`, true).catch((error) => error);
      return record;
    }

    const record = await search(`rec.id=${id}`, true).catch((error) => error);
    return record;
  }

  async function getRecordByIssn(issn, additionalQueryParams = false) {
    if (additionalQueryParams) {
      const record = await search(`bath.issn=${issn}${handleAdditionalQueryParams(additionalQueryParams)}`, true);
      return record;
    }

    const record = await search(`bath.issn=${issn}`, true);
    return record;
  }

  async function getRecordByIsbn(isbn, additionalQueryParams = false) {
    if (additionalQueryParams) {
      const record = await search(`bath.isbn=${isbn}${handleAdditionalQueryParams(additionalQueryParams)}`, true);
      return record;
    }

    const record = await search(`bath.isbn=${isbn}`, true);
    return record;
  }

  function search(query, one = false) {
    return new Promise((resolve, reject) => {
      const promises = []; // eslint-disable-line functional/no-let

      // rec.id -> foo.bar --> virhe

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
            //resolve();
            reject(new SruError(404, 'Not found.'));
          } catch (err) {
            reject(err);
          }
        })
        .on('error', err => reject(err));
    });
  }

  function handleAdditionalQueryParams(additionalQueryParams) {
    if (parseBoolean(additionalQueryParams.arto)) {
      return ' AND melinda.collection=arto';
    }

    if (parseBoolean(additionalQueryParams.reviewSearch)) {
      return '';
    }

    return `&${new URLSearchParams(additionalQueryParams).toString()}`;
  }
}
