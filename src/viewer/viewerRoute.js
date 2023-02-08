/******************************************************************************
 *
 * Record fetching and modifying for UIs
 *
 ******************************************************************************
 */

/* eslint-disable no-unused-vars */

import {Router} from 'express';
import httpStatus from 'http-status';
import {Error as HttpError} from '@natlibfi/melinda-commons';
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

    const {expanded} = req.query || {};

    const params = {
      expanded,
      limit: 0
    };

    try {
      const result = await logService.getCorrelationIdList(params);
      logger.debug('*******************************************');
      res.json(result);
    } catch (error) {
      return next(error);
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

  async function removeLog(req, res, next) {
    const {id: correlationId} = req.params || {};
    const {force} = req.query || {};

    const params = {
      force
    };

    logger.debug(`Removing log: ${JSON.stringify(correlationId)}`);

    try {
      const result = await logService.removeLog(correlationId, params);
      logger.debug('*******************************************');
      res.json(result);
    } catch (e) {
      return next(e);
    }
  }

  function handleRouteNotFound(req, res, next) {
    const {path, query, method} = req;
    logger.error(`Error: it seems that this Viewer route is not found!`);
    logger.debug(`Request method: ${method} | Path: ${path} | Query strings: ${JSON.stringify(query)}`);
    res.sendStatus(404);
  }

  function handleError(err, req, res, next) {
    logger.error(`Error: ${err}`);
    logger.debug(`Error: viewerRoute.js [error status code: ${err.status} | error message: ${err.payload}]`);

    if (err instanceof HttpError) {
      logger.debug(`Sending the received httpError '${err.status} - ${httpStatus[err.status]}' with message '${err.payload}' forward`);
      return res.status(err.status).send(err.payload);
    }

    if (err.status) {
      logger.debug(`Sending the received error status code '${err.status} - ${httpStatus[err.status]}' forward`);
      return res.sendStatus(err.status);
    }

    logger.debug(`No status code received in error, sending code '500 - Internal server error' instead`);
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }

}
