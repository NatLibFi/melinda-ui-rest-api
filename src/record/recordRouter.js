/* eslint-disable prefer-destructuring */
/*****************************************************************************/
/*                                                                           */
/* Record addition and validation for UI                                     */
/*                                                                           */
/*****************************************************************************/

//import httpStatus from 'http-status';

import express, {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import createRecordOperator from './recordService.js';
import {handleFailedQueryParams} from '../requestUtils/handleFailedQueryParams.js';
import {handleFailedRouteParams} from '../requestUtils/handleFailedRouteParams.js';
import {handleRouteNotFound} from '../requestUtils/handleRouteNotFound.js';
import {handleError} from '../requestUtils/handleError.js';


export default function (melindaApiOptions) {
  const logger = createLogger();
  const recordOperator = createRecordOperator(melindaApiOptions);
  const appName = 'Record (Artikkelit)';

  return new Router(melindaApiOptions)
    .use(handleFailedQueryParams(appName))
    .use(express.json())
    .post('/add', handleFailedRouteParams(appName), addArticleRecord)
    .post('/validate', handleFailedRouteParams(appName), validateArticleRecord)
    .use(handleRouteNotFound(appName))
    .use(handleError(appName));


  async function addArticleRecord(req, res, next) {
    logger.info('POST article record: addition');

    const record = req.body;

    logger.verbose(`Adding article record: ${JSON.stringify(record)}`);

    try {
      //placeholder for testing:
      //await res.sendStatus(httpStatus.CREATED);

      const result = await recordOperator.addRecord(record);
      res.json(result);
    } catch (error) {
      return next(error);
    }

  }

  async function validateArticleRecord(req, res, next) {
    logger.info('POST article record: validation only');

    const record = req.body;

    logger.verbose(`Validating article record: ${JSON.stringify(record)}`);

    try {
      //placeholders for testing:
      //await res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
      //await res.sendStatus(httpStatus.OK);

      const result = await recordOperator.validateRecord(record);
      res.json(result);
    } catch (error) {
      return next(error);
    }
  }

}
