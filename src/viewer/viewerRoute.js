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
    const result = await logService.getMatchLog(params);
    logger.debug(JSON.stringify(result));
    res.json(result);
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
    const result = await logService.getMatchValidationLog(params);
    logger.debug(JSON.stringify(result));
    res.json(result);
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
    const result = await logService.getMergeLog(params);
    logger.debug('*******************************************');
    res.json(result);
  }

  async function getCorrelationIdList(req, res, next) {
    logger.verbose('GET getCorrelationIdList');

    const {expanded} = req.query || {};

    const params = {
      expanded,
      limit: 0
    };

    try {
      const result = await logService.getCorrelationIdList(params);
      logger.debug('*******************************************');
      res.json(result);
    } catch (e) {
      return next(e);
    }

  }

  async function protectLog(req, res, next) {
    const {id: correlationId} = req.params || {};
    const {sequence: blobSequence} = req.query || {};

    const params = {
      blobSequence
    };

    logger.debug(`Protecting log id: ${JSON.stringify(correlationId)}, sequence: ${JSON.stringify(params.blobSequence)}`);

    try {
      const result = await logService.protectLog(correlationId, params);
      logger.debug('*******************************************');
      res.json(result);
    } catch (e) {
      return next(e);
    }
  }

  function removeLog(req, res, next) {
    const {id: correlationId} = req.params || {};
    const {logType: logItemType} = req.query || {};

    const params = {
      ...correlationId,
      ...logItemType
    };

    logger.debug(`Removing log: ${params.correlationId}`);
    res.sendStatus(200);
  }

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

}
