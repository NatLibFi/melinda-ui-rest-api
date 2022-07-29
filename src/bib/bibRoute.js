import {Router} from 'express';

//import {Error as APIError} from '@natlibfi/melinda-commons';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {getRecordByID} from './bibService';

// https://github.com/NatLibFi/marc-record-serializers

export default function (sruUrl) { // eslint-disable-line no-unused-vars
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

  async function fetchOne(req, res) {
    const {id} = req.params;

    logger.debug(`Params..: ${JSON.stringify(req.params)}`);
    logger.debug(`Fetching: ${id}`);

    const result = await getRecordByID(id);
    res.json(result);
  }

  //---------------------------------------------------------------------------

  function updateOne(req, res) { // eslint-disable-line no-unused-vars
    //logger.debug(`SRU: ${sruUrl}`);
    //logger.debug(`REQ: ${JSON.stringify(req.params)}`);
    //logger.debug(req, res);

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
