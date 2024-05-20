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

    //set required data to cookie with proper options
    const cookieOptions = getCookieOptions();
    res.cookie('melinda-user-name', user.Name, cookieOptions);
    res.cookie('melinda-user-token', user.Token, cookieOptions); //update options httponly true and handle all token handling on server side
    res.status(HttpStatus.OK).json(user);
  }

  function getCookieOptions() {
    const isInProduction = process.env.NODE_ENV === 'production';// eslint-disable-line
    const timeToLive = getHoursInMilliSeconds(12);
    //logger.debug(timeToLive);
    if (isInProduction) {
      return {httpOnly: false, SameSite: 'None', secure: true, maxAge: timeToLive};
    }

    return {httpOnly: false, SameSite: 'None', secure: false, maxAge: timeToLive};

    function getHoursInMilliSeconds(requestedHourCount) {
      return requestedHourCount * 60 * 60 * 1000;
    }
  }

  function verify(req, res) {
    res.sendStatus(HttpStatus.OK);
  }
}
