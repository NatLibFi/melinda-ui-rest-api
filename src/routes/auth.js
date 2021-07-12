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
  logger.debug('Creating auth route');

  return new Router()
    .use(loginfo)
    .use(passport.authenticate('melinda', {session: false}))
    .post('/', create)
    .use(handleError);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  function loginfo(req, res, next) {
    logger.debug(`Auth in: ${req.headers.authorization}`);
    next();
  }

  function create(req, res) {
    logger.debug(`User: ${JSON.stringify(req.user)}`);
    logger.debug(`Token: ${req.headers.authorization}`);
    //const sanitazedUser = sanitaze(req.user);
    const user = {
      ...req.user,
      Token: req.headers.authorization
    };
    res.set('User', JSON.stringify(user));
    res.sendStatus(HttpStatus.NO_CONTENT);
  }

  function sanitaze(value) { // eslint-disable-line no-unused-vars
    return value
      .replace(/\r/gu, '')
      .replace(/%0d/gu, '')
      .replace(/%0D/gu, '')
      .replace(/\n/gu, '')
      .replace(/%0a/gu, '')
      .replace(/%0A/gu, '');
  }
}
