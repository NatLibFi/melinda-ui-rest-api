import {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {createBibService} from './bibService';
import {handleFailedQueryParams} from '../requestUtils/handleFailedQueryParams';
import {handleFailedRouteParams} from '../requestUtils/handleFailedRouteParams';
import {handleRouteNotFound} from '../requestUtils/handleRouteNotFound';
import {handleError} from '../requestUtils/handleError';

// https://github.com/NatLibFi/marc-record-serializers

export default function (sruUrl) {
  const logger = createLogger();
  const bibService = createBibService(sruUrl);
  const appName = 'Bib (artikkelit)';

  return new Router()
    .use(handleFailedQueryParams(appName))
    .get('/title/:title', handleFailedRouteParams(appName), fetchOneByTitle)
    .get('/isbn/:isbn', handleFailedRouteParams(appName), fetchOneByIsbn)
    .get('/issn/:issn', handleFailedRouteParams(appName), fetchOneByIssn)
    .get('/:id', handleFailedRouteParams(appName), fetchOneByMelindaId)
    //.put('/:id', handleFailedRouteParams(appName), updateOne)
    .use(handleRouteNotFound(appName))
    .use(handleError(appName));

  //---------------------------------------------------------------------------

  async function fetchOneByTitle(req, res, next) {
    logger.info('GET publication by title');

    const {title} = req.params;
    const {arto, fennica, melinda, type, ...rest} = req.query;
    const collectionQueryParams = {arto, fennica, melinda};
    const typeParam = type;
    const additionalQueryParams = rest;

    logger.verbose(`Fetching ${typeParam} with title '${title}'`);
    logger.verbose(`Fetching using collection parameters ${JSON.stringify(collectionQueryParams)}`);
    logger.verbose(Object.keys(additionalQueryParams).length > 0 ? `Fetching with these additional query parameters: ${JSON.stringify(additionalQueryParams)}` : `No additional query parameters added for fetching`);

    try {
      const result = await bibService.getRecordByTitle(title, typeParam, collectionQueryParams, additionalQueryParams);
      res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async function fetchOneByIsbn(req, res, next) {
    logger.info('GET publication by ISBN');

    const {isbn} = req.params;

    logger.debug(`Params..: ${JSON.stringify(req.params)}`);
    logger.debug(`Query..: ${JSON.stringify(req.query)}`);
    logger.debug(`Fetching: ${isbn}`);

    try {
      const result = await bibService.getRecordByIsbn(isbn, req.query);
      res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async function fetchOneByIssn(req, res, next) {
    logger.info('GET publication by ISSN');
    const {issn} = req.params;

    logger.debug(`Params..: ${JSON.stringify(req.params)}`);
    logger.debug(`Query..: ${JSON.stringify(req.query)}`);
    logger.debug(`Fetching: ${issn}`);

    try {
      const result = await bibService.getRecordByIssn(issn, req.query);
      res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async function fetchOneByMelindaId(req, res, next) {
    logger.info('GET publication by Melinda ID');
    const {id} = req.params;

    logger.debug(`Params..: ${JSON.stringify(req.params)}`);
    logger.debug(`Query..: ${JSON.stringify(req.query)}`);
    logger.debug(`Fetching: ${id}`);

    try {
      const result = await bibService.getRecordByID(id, req.query);
      res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  //---------------------------------------------------------------------------

  /*
  function updateOne(req, res) {
    //logger.debug(`SRU: ${sruUrl}`);
    //logger.debug(`REQ: ${JSON.stringify(req.params)}`);
    //logger.debug(req, res);

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
  }
  */

}
