/******************************************************************************
 *
 * Record fetching and modifying for UIs
 *
 ******************************************************************************
 */

/* eslint-disable no-unused-vars */

import {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {createMelindaApiLogClient} from '@natlibfi/melinda-rest-api-client';
import {createLogService} from './viewerService';
import {handleFailedQueryParams} from '../requestUtils/handleFailedQueryParams';
import {handleFailedRouteParams} from '../requestUtils/handleFailedRouteParams';
import {handleRouteNotFound} from '../requestUtils/handleRouteNotFound';
import {handleError} from '../requestUtils/handleError';

export default function (melindaApiOptions) {
  const logger = createLogger();
  const restApiLogClient = createMelindaApiLogClient(melindaApiOptions);
  const logService = createLogService(restApiLogClient);
  const appName = 'Viewer';

  return new Router(melindaApiOptions)
    .use(handleFailedQueryParams(appName))
    .get('/match-log/:id', handleFailedRouteParams(appName), getMatchLog)
    .get('/match-validation-log/:id', handleFailedRouteParams(appName), getMatchValidationLog)
    .get('/merge-log/:id', handleFailedRouteParams(appName), getMergeLog)
    .get('/correlation-id-list', handleFailedRouteParams(appName), getCorrelationIdList)
    .put('/protect/:id', handleFailedRouteParams(appName), protectLog)
    .delete('/remove/:id', handleFailedRouteParams(appName), removeLog)
    .use(handleRouteNotFound(appName))
    .use(handleError(appName));


  async function getMatchLog(req, res, next) {
    logger.verbose('GET getMatchLog');
    const correlationId = req.params.id;
    const blobSequence = req.query.sequence;

    const params = {
      correlationId,
      ...blobSequence ? {blobSequence} : {},
      limit: 0
    };

    logger.debug(`Getting match log with correlation id ${JSON.stringify(params.correlationId)}`);
    logger.debug(blobSequence ? `Sequence selected for fetching: ${JSON.stringify(params.blobSequence)}` : `No sequence selected, getting all sequences for this id`);


    try {
      const result = await logService.getMatchLog(params);
      res.json(result);
    } catch (error) {
      return next(error);
    }

  }

  async function getMatchValidationLog(req, res, next) {
    logger.verbose('GET getMatchValidationLog');

    const correlationId = req.params.id;
    const blobSequence = req.query.sequence;

    const params = {
      correlationId,
      ...blobSequence ? {blobSequence} : {},
      limit: 0
    };

    logger.debug(`Getting match validation log with correlation id ${JSON.stringify(params.correlationId)}`);
    logger.debug(blobSequence ? `Sequence selected for fetching: ${JSON.stringify(params.blobSequence)}` : `No sequence selected, getting all sequences for this id`);


    try {
      const result = await logService.getMatchValidationLog(params);
      res.json(result);
    } catch (error) {
      return next(error);
    }

  }

  async function getMergeLog(req, res, next) {
    logger.verbose('GET getMergeLog');

    const correlationId = req.params.id;
    const blobSequence = req.query.sequence;

    const params = {
      correlationId,
      ...blobSequence ? {blobSequence} : {},
      limit: 0
    };

    logger.debug(`Getting merge log with correlation id ${JSON.stringify(params.correlationId)}`);
    logger.debug(blobSequence ? `Sequence selected for fetching: ${JSON.stringify(params.blobSequence)}` : `No sequence selected, getting all sequences for this id`);

    try {
      const result = await logService.getMergeLog(params);
      logger.debug('*******************************************');
      res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async function getCorrelationIdList(req, res, next) {
    logger.verbose('GET getCorrelationIdList');

    const {expanded} = req.query;

    const params = {
      expanded,
      limit: 0
    };

    logger.debug(`Getting correlation id list with expanded value: ${JSON.stringify(params.expanded)}`);

    try {
      const result = await logService.getCorrelationIdList(params);
      logger.debug('*******************************************');
      res.json(result);
    } catch (error) {
      return next(error);
    }

  }

  async function protectLog(req, res, next) {
    logger.verbose('PUT protectLog');

    const correlationId = req.params.id;
    const blobSequence = req.query.sequence;

    const params = blobSequence ? blobSequence : {};

    logger.debug(`Protecting (or unprotecting) log id: ${JSON.stringify(correlationId)}`);
    logger.debug(blobSequence ? `Sequence selected for protecting: ${JSON.stringify(params.blobSequence)}` : `No sequence selected, protecting all sequences for this id`);

    try {
      const result = await logService.protectLog(correlationId, params);
      logger.debug('*******************************************');
      res.json(result);
    } catch (e) {
      return next(e);
    }
  }

  async function removeLog(req, res, next) {
    logger.verbose('DELETE removeLog');

    const correlationId = req.params.id;
    const {force} = req.query;

    const params = {
      force
    };

    logger.debug(`Removing log: ${JSON.stringify(correlationId)}, params: ${JSON.stringify(params)}`);

    try {
      const result = await logService.removeLog(correlationId, params);
      logger.debug('*******************************************');
      res.json(result);
    } catch (e) {
      return next(e);
    }
  }

}
