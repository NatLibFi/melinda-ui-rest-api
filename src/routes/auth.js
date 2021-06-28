/******************************************************************************
 *
 * Authentication
 *
 ******************************************************************************
 */

import {Router} from 'express';
import passport from 'passport';

//import {Error as APIError} from '@natlibfi/melinda-commons';
import {createLogger} from '@natlibfi/melinda-backend-commons';
//import createClient from '@natlibfi/sru-client';
//import {MARCXML} from '@natlibfi/marc-record-serializers';

// https://github.com/NatLibFi/marc-record-serializers

export default function (sruUrl) { // eslint-disable-line no-unused-vars
  const logger = createLogger();

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  return new Router()
    .use(passport.authenticate('melinda', {session: false}))
    //.get('/', testFunction)
    .use(handleError);
}
