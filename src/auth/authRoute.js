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
  //logger.debug('Creating auth route');

  return new Router()
    //.use(sanitaze)
    .post('/verify', verify)
    .post('/', create)
    .use(handleError);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  function create(req, res) {
    // Strip files
    const user = {
      Name: req.user.displayName,
      Token: generateJwtToken(req.user, jwtOptions)
    };

    res
      .status(HttpStatus.OK)
      .json(user);
  }

  function verify(req, res) {
    res.sendStatus(HttpStatus.OK);
  }
}
