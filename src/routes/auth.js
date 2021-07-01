/******************************************************************************
 *
 * Authentication
 *
 ******************************************************************************
 */

import HttpStatus from 'http-status';
import {Router} from 'express';
import passport from 'passport';

//import {Error as APIError} from '@natlibfi/melinda-commons';
import {createLogger} from '@natlibfi/melinda-backend-commons';
//import createClient from '@natlibfi/sru-client';
//import {MARCXML} from '@natlibfi/marc-record-serializers';

// https://github.com/NatLibFi/marc-record-serializers

export default function () { // eslint-disable-line no-unused-vars
  const logger = createLogger();

  return new Router()
    .use(passport.authenticate('melinda', {session: false}))
    .post('/', create)
    .use(handleError);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }


  function create(req, res) {
    const sanitazedUser = sanitaze(req.user);
    res.set('Token', sanitazedUser);
    res.sendStatus(HttpStatus.NO_CONTENT);
  }

  function sanitaze(value) {
    return value
      .replace(/\r/gu, '')
      .replace(/%0d/gu, '')
      .replace(/%0D/gu, '')
      .replace(/\n/gu, '')
      .replace(/%0a/gu, '')
      .replace(/%0A/gu, '');
  }
}
