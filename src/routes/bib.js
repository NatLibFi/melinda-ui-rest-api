import {Router} from 'express';

//import {Error as APIError} from '@natlibfi/melinda-commons';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import createClient from '@natlibfi/sru-client';
import {MARCXML} from '@natlibfi/marc-record-serializers';

// https://github.com/NatLibFi/marc-record-serializers

export default function (sruUrl) {
  const logger = createLogger();

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  return new Router()
    .get('/:id', fetchOne)
    .put('/:id', updateOne)
    //.get('/', testFunction)
    .use(handleError);

  //---------------------------------------------------------------------------

  function fetchOne(req, res) {
    logger.debug(`SRU: ${sruUrl}`);
    //logger.debug(`REQ fields: ${Object.keys(req)}`);
    //logger.debug(`REQ headers: ${JSON.stringify(req.headers)}`);
    logger.debug(`Header.authorization: ${req.headers.authorization}`);
    //logger.debug(`REQ passport: ${JSON.stringify(req.passport)}`);
    //logger.debug(`REQ user: ${JSON.stringify(req.user)}`);
    //logger.debug(`REQ authInfo: ${JSON.stringify(req.authInfo)}`);
    logger.debug(`REQ params: ${JSON.stringify(req.params)}`);

    // localhost:8081/bib/001234567
    // localhost:8081/bib/000018526 - miksi ei tule?
    // localhost:8081/bib/101234567 - pitäis tulla 404
    // params.id = "001234567"
    // SRU =  https://sru.api.melinda-test.kansalliskirjasto.fi/bib

    const client = createClient({
      url: sruUrl,
      recordSchema: 'marcxml', // Resp = xml
      //recordSchema: 'marc', // Resp = error
      retrieveAll: false
      //maxRecordsPerRequest: 1
    });

    client.searchRetrieve(req.params.id)
      .on('record', record => processRecord(record))
      .on('end', () => endProcessing())
      .on('error', err => handleError(err));

    let recordPromise; // eslint-disable-line

    function processRecord(data) {
      //logger.debug(`Process record ${data}`);
      recordPromise = MARCXML.from(data, {subfieldValues: false});
    }

    // https://github.com/NatLibFi/melinda-rest-api-http/blob/0252517d2184f6cddd07ed44bf0a42dbf0d5eb21/src/interfaces/prio.js#L165

    function endProcessing() {
      logger.debug('End Processing');
      //logger.debug(`record Promise ${recordPromise}`);
      Promise.resolve(recordPromise).then(result => {
        //logger.debug(`Got result ${result}`);
        res.json(result);
      });
    }

    function handleError(err) {
      logger.error(`handleError ${err}`);
      // https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
      // https://www.npmjs.com/package/http-status
      //next(new APIError(404, 'errori tuli'));
    }
  }

  //---------------------------------------------------------------------------

  function updateOne(req, res) {
    logger.debug(`SRU: ${sruUrl}`);
    logger.debug(`REQ: ${JSON.stringify(req.params)}`);
    logger.debug(req, res);

    /*
    {
      // Päivitystieto
      "tag": "CAT",
      "ind1": " ",
      "ind2": " ",
      "subfields": [
        {
          "code": "a",          // Muutoksen tekijä
          "value": "LOAD-ARTO"  // Artikkelitietokanta ARTO:n massatuonti
        },
        {
          "code": "b",        // Päivitystaso
          "value": "20"       // ???
        },
        {
          "code": "c",          // Date
          "value": "20180608"   // 8.6.2018
        },
        {
          "code": "l",      // Library-taso alephissa
          "value": "FIN01"  // FIN01 = bib
        },
        {
          "code": "h",      // Kellonaika
          "value": "0052"   // 00:52
        }
      ]
    },
    */
  }
}
