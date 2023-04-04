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
import {handleRouteNotFound} from '../routeUtils/handleRouteNotFound';
import {handleError} from '../routeUtils/handleError';

export default function (melindaApiOptions) {
  const logger = createLogger();
  const restApiLogClient = createMelindaApiLogClient(melindaApiOptions);
  const logService = createLogService(restApiLogClient);

  return new Router(melindaApiOptions)
    .get('/match-log/:id', getMatchLog)
    .get('/match-validation-log/:id', getMatchValidationLog)
    .get('/merge-log/:id', getMergeLog)
    .get('/correlation-id-list', getCorrelationIdList)
    .put('/protect/:id', protectLog)
    .delete('/remove/:id', removeLog)
    .use(handleRouteNotFound)
    .use(handleError);

  async function getMatchLog(req, res, next) {
    logger.verbose('GET getMatchLog');
    const {id: correlationId} = req.params;
    const {sequence: blobSequence} = req.query || {};

    const params = {
      correlationId,
      ...blobSequence,
      limit: 0
    };

    logger.debug(JSON.stringify(params));

    try {
      const result = await logService.getMatchLog(params);
      logger.debug(JSON.stringify(result));
      res.json(result);
    } catch (error) {
      return next(error);
    }

  }

  async function getMatchValidationLog(req, res, next) {
    logger.verbose('GET getMatchValidationLog');

    const {id: correlationId} = req.params;
    const {sequence: blobSequence} = req.query || {};

    const params = {
      correlationId,
      ...blobSequence,
      limit: 0
    };

    logger.debug(JSON.stringify(params));

    try {
      const result = await logService.getMatchValidationLog(params);
      logger.debug(JSON.stringify(result));
      res.json(result);
    } catch (error) {
      return next(error);
    }

  }

  async function getMergeLog(req, res, next) {
    logger.verbose('GET getMergeLog');

    const {id: correlationId} = req.params;
    const {sequence: blobSequence} = req.query || {};

    const params = {
      correlationId,
      ...blobSequence,
      limit: 0
    };

    logger.debug(JSON.stringify(params));

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

    const expanded = req.query.expanded || 0;

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
    const {sequence} = req.query;

    const params = sequence ? {blobSequence: sequence} : {};

    logger.debug(`Protecting log id: ${JSON.stringify(correlationId)}`);
    logger.debug(sequence ? `Sequence selected for protecting: ${JSON.stringify(params.blobSequence)}` : `No sequence selected, protecting all sequences for this id`);

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
    const force = req.query.force || 0;

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
