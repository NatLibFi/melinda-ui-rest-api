import {Router} from 'express';
import {Error as HttpError} from '@natlibfi/melinda-commons';
//import {Error as APIError} from '@natlibfi/melinda-commons';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {createBibService} from './bibService';

// https://github.com/NatLibFi/marc-record-serializers

export default async function (sruUrl) { // eslint-disable-line no-unused-vars
  const logger = createLogger();
  const bibService = await createBibService(sruUrl);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  return new Router()
    .get('/title/:title', fetchOneByTitle)
    .get('/isbn/:isbn', fetchOneByIsbn)
    .get('/issn/:issn', fetchOneByIssn)
    .get('/:id', fetchOneByMelindaId)
    .put('/:id', updateOne)
    //.get('/', testFunction)
    .use(handleError);

  //---------------------------------------------------------------------------

  async function fetchOneByTitle(req, res) {
    const {title} = req.params;

    logger.debug(`Params..: ${JSON.stringify(req.params)}`);
    logger.debug(`Query..: ${JSON.stringify(req.query)}`);
    logger.debug(`Fetching: ${title}`);

    const result = await bibService.getRecordByTitle(title, req.query);
    res.json(result);
  }

  async function fetchOneByIsbn(req, res) {
    const {isbn} = req.params;

    logger.debug(`Params..: ${JSON.stringify(req.params)}`);
    logger.debug(`Query..: ${JSON.stringify(req.query)}`);
    logger.debug(`Fetching: ${isbn}`);

    const result = await bibService.getRecordByIsbn(isbn, req.query);
    res.json(result);
  }

  async function fetchOneByIssn(req, res) {
    const {issn} = req.params;

    logger.debug(`Params..: ${JSON.stringify(req.params)}`);
    logger.debug(`Query..: ${JSON.stringify(req.query)}`);
    logger.debug(`Fetching: ${issn}`);

    const result = await bibService.getRecordByIssn(issn, req.query);
    res.json(result);
  }

  async function fetchOneByMelindaId(req, res) {
    try {
      const {id} = req.params;

      logger.debug(`Params..: ${JSON.stringify(req.params)}`);
      logger.debug(`Query..: ${JSON.stringify(req.query)}`);
      logger.debug(`Fetching: ${id}`);

      const result = await bibService.getRecordByID(id, req.query);
      res.json(result);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).send(error.payload);
      }
      console.log(error); // eslint-disable-line
      res.status(500);
    }
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
