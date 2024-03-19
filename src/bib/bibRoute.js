import {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {createBibService} from './bibService';
import {handleFailedQueryParams} from '../requestUtils/handleFailedQueryParams';
import {handleFailedRouteParams} from '../requestUtils/handleFailedRouteParams';
import {handleRouteNotFound} from '../requestUtils/handleRouteNotFound';
import {handleError} from '../requestUtils/handleError';

export default function (sruUrl) {
  const logger = createLogger();
  const bibService = createBibService(sruUrl);
  const appName = 'Bib (artikkelit)';

  return new Router()
    .use(handleFailedQueryParams(appName))
    .get('/:id', handleFailedRouteParams(appName), fetchByMelindaId)
    .get('/isbn/:isbn', handleFailedRouteParams(appName), fetchByIsbn)
    .get('/issn/:issn', handleFailedRouteParams(appName), fetchByIssn)
    .get('/title/:title', handleFailedRouteParams(appName), fetchByTitle)
    .use(handleRouteNotFound(appName))
    .use(handleError(appName));

  //---------------------------------------------------------------------------

  async function fetchByMelindaId(req, res, next) {
    logger.info('GET publications by Melinda ID');
    const {id} = req.params;
    const {arto, fennica, melinda, type, ...rest} = req.query;
    const collectionQueryParams = {arto, fennica, melinda};
    const typeParam = type;
    const additionalQueryParams = rest;

    logger.verbose(`Fetching ${typeParam} with Melinda-ID '${id}`);
    logger.verbose(`Fetching using collection parameters ${JSON.stringify(collectionQueryParams)}`);
    logger.verbose(Object.keys(additionalQueryParams).length > 0 ? `Fetching with these additional query parameters: ${JSON.stringify(additionalQueryParams)}` : `No additional query parameters added for fetching`);

    try {
      const result = await bibService.getRecordById(id, typeParam, collectionQueryParams, additionalQueryParams);
      res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async function fetchByIsbn(req, res, next) {
    logger.info('GET publications by ISBN');

    const {isbn} = req.params;
    const {arto, fennica, melinda, type, ...rest} = req.query;
    const collectionQueryParams = {arto, fennica, melinda};
    const typeParam = type;
    const additionalQueryParams = rest;

    logger.verbose(`Fetching ${typeParam} with ISBN '${isbn}'`);
    logger.verbose(`Fetching using collection parameters ${JSON.stringify(collectionQueryParams)}`);
    logger.verbose(Object.keys(additionalQueryParams).length > 0 ? `Fetching with these additional query parameters: ${JSON.stringify(additionalQueryParams)}` : `No additional query parameters added for fetching`);

    try {
      const result = await bibService.getRecordByIsbn(isbn, typeParam, collectionQueryParams, additionalQueryParams);
      res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async function fetchByIssn(req, res, next) {
    logger.info('GET publications by ISSN');

    const {issn} = req.params;
    const {arto, fennica, melinda, type, ...rest} = req.query;
    const collectionQueryParams = {arto, fennica, melinda};
    const typeParam = type;
    const additionalQueryParams = rest;

    logger.verbose(`Fetching ${typeParam} with ISSN '${issn}'`);
    logger.verbose(`Fetching using collection parameters ${JSON.stringify(collectionQueryParams)}`);
    logger.verbose(Object.keys(additionalQueryParams).length > 0 ? `Fetching with these additional query parameters: ${JSON.stringify(additionalQueryParams)}` : `No additional query parameters added for fetching`);

    try {
      const result = await bibService.getRecordByIssn(issn, typeParam, collectionQueryParams, additionalQueryParams);
      res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async function fetchByTitle(req, res, next) {
    logger.info('GET publications by title');

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

}
