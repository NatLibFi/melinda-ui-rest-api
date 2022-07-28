/******************************************************************************
 *
 * Record fetching and modifying for UIs
 *
 ******************************************************************************
 */

/* eslint-disable no-unused-vars */

import HttpStatus from 'http-status';
import express, {Router} from 'express';
import {generateJwtToken} from '@natlibfi/passport-melinda-jwt';
//import {Error as APIError} from '@natlibfi/melinda-commons';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {createMelindaApiLogClient} from '@natlibfi/melinda-rest-api-client';
import {createLogService} from './viewerService';
//import createClient from '@natlibfi/sru-client';
//import {MARCXML} from '@natlibfi/marc-record-serializers';

// https://github.com/NatLibFi/marc-record-serializers

export default function (melindaApiOptions) { // eslint-disable-line no-unused-vars
  const logger = createLogger();
  const restApiLogClient = createMelindaApiLogClient(melindaApiOptions);
  const logService = createLogService(restApiLogClient);

  return new Router(melindaApiOptions)
    .get('/match-log/:id/:sequence', getMatchLog)
    .get('/match-validation-log/:id/:sequence', getMatchValidationLog)
    .get('/merge-log/:id/:sequence', getMergeLog)
    .use(handleError);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  async function getMatchLog(req, res, next) {
    logger.verbose('GET getMatchLog');

    const params = {
      correlationId: req.params.id,
      blobSequence: req.params.sequence
    };

    logger.debug(JSON.stringify(params));
    const result = await logService.getMatchLog(params);
    logger.debug(JSON.stringify(result));
    res.json(result);
  }

  async function getMatchValidationLog(req, res, next) {
    logger.verbose('GET getMatchValidationLog');

    const params = {
      correlationId: req.params.id,
      blobSequence: req.params.sequence
    };

    logger.debug(JSON.stringify(params));
    const result = await logService.getMatchValidationLog(params);
    logger.debug(JSON.stringify(result));
    res.json(result);
  }

  async function getMergeLog(req, res, next) {
    logger.verbose('GET getMergeLog');

    const params = {
      correlationId: req.params.id,
      blobSequence: req.params.sequence
    };

    logger.debug(JSON.stringify(params));
    const result = await logService.getMergeLog(params);
    logger.debug(JSON.stringify(result));
    res.json(result);
  }
}
