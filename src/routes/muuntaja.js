/******************************************************************************
 *
 * Services for muuntaja
 *
 ******************************************************************************
 */

import HttpStatus from 'http-status';
import {Router} from 'express';
//import {Error as APIError} from '@natlibfi/melinda-commons';
import {createLogger} from '@natlibfi/melinda-backend-commons';
//import createClient from '@natlibfi/sru-client';
//import {MARCXML} from '@natlibfi/marc-record-serializers';

// https://github.com/NatLibFi/marc-record-serializers

export default function (jwtOptions) { // eslint-disable-line no-unused-vars
  const logger = createLogger();
  logger.debug('Creating muuntaja route');

  return new Router()
    .post('/', test)
    .use(handleError);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  function test(req, res) {
    logger.debug(`Test`);
    res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
