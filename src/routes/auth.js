/******************************************************************************
 *
 * Authentication
 *
 ******************************************************************************
 */

import HttpStatus from 'http-status';
import {Router} from 'express';
import {generateJwtToken} from '@natlibfi/passport-melinda-jwt';
//import {Error as APIError} from '@natlibfi/melinda-commons';
import {createLogger} from '@natlibfi/melinda-backend-commons';
//import createClient from '@natlibfi/sru-client';
//import {MARCXML} from '@natlibfi/marc-record-serializers';

// https://github.com/NatLibFi/marc-record-serializers

export default function (jwtOptions) { // eslint-disable-line no-unused-vars
  const logger = createLogger();
  logger.debug('Creating auth route');

  return new Router()
    //.use(sanitaze)
    .post('/verify', verify)
    .post('/', create)
    .use(handleError);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  function sanitaze(req, res, next) { // eslint-disable-line no-unused-vars
    const auth = req.headers.authorization;
    const {token} = auth.match(/Basic (?<token>.*)/u).groups;

    //logger.debug(`Auth in: ${auth}`);
    //logger.debug(`Token: ${token}`);

    const decoded = Buffer.from(token, 'base64').toString('ascii');
    const sanitized = decoded
      .replace(/\r/gu, '')
      .replace(/%0d/gu, '')
      .replace(/%0D/gu, '')
      .replace(/\n/gu, '')
      .replace(/%0a/gu, '')
      .replace(/%0A/gu, '');

    //logger.debug(`Decoded: ${decoded}`);
    //logger.debug(`Sanitized: ${sanitized}`);

    const encoded = Buffer.from(sanitized).toString('base64');
    req.headers.authorization = `Basic ${encoded}`; // eslint-disable-line functional/immutable-data
    next();
  }

  function create(req, res) {
    logger.debug(`User: ${JSON.stringify(req.user)}`);
    logger.debug(`Token: ${req.headers.authorization}`);
    //const sanitazedUser = sanitaze(req.user);

    // Strip files
    const user = {
      Name: req.user.displayName,
      Token: `melinda ${generateJwtToken(req.user, jwtOptions)}`
    };

    logger.debug(`returning: ${JSON.stringify(user)}`);

    res.set('User', JSON.stringify(user));
    res.sendStatus(HttpStatus.NO_CONTENT);
  }

  function verify(req, res) {
    logger.debug(`User: ${JSON.stringify(req.user)}`);
    res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
