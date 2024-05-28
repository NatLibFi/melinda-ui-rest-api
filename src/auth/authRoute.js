/******************************************************************************
 *
 * Authentication
 *
 ******************************************************************************
 */

import HttpStatus from 'http-status';
import express, {Router} from 'express';
import {generateJwtToken} from '@natlibfi/passport-melinda-jwt';
//import {Error as APIError} from '@natlibfi/melinda-commons';
import {createLogger} from '@natlibfi/melinda-backend-commons';
//import createClient from '@natlibfi/sru-client';
//import {MARCXML} from '@natlibfi/marc-record-serializers';
import {generateAuthorizationHeader} from '@natlibfi/melinda-commons';
import {sanitaze} from '../services/authService.js';

// https://github.com/NatLibFi/marc-record-serializers

export default function (passport, jwtOptions) { // eslint-disable-line no-unused-vars
  const logger = createLogger();
  //logger.debug('Creating auth route');
  const cookieNames = {
    userName: 'melinda-user-name',
    userToken: 'melinda', //'melinda-user-token',
    jwtToken: 'melinda'
  };

  return new Router()
    //.use(sanitaze)
    //Limit authentication to token of that type
    .use(express.json())
    .post('/login', passport.authenticate('melinda', {session: false}), login)
    .post('/getBaseToken', getBaseToken)
    .get('/verify', passport.authenticate('jwt', {session: false}), verify)
    .post('/logout', passport.authenticate('jwt', {session: false}), logout)
    .use(handleError);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  //************************ */
  //route functions
  //************************ */

  function login(req, res) {
    // Strip files
    const user = {
      Name: req.user.displayName,
      Token: generateJwtToken(req.user, jwtOptions)
    };

    //set required data to cookie with proper options
    const isInProduction = process.env.NODE_ENV === 'production';// eslint-disable-line
    const timeToLive = getHoursInMilliSeconds(12);
    //username should be available to client
    const nameCookieOptions = {
      httpOnly: false,
      SameSite: 'None',
      secure: false,
      maxAge: timeToLive
    };
    const tokenCookieOptions = {
      httpOnly: true,
      SameSite: 'None',
      secure: false,
      maxAge: timeToLive
    };
    const productionTokenCookieOption = {
      httpOnly: true,
      SameSite: 'None',
      secure: true,
      maxAge: timeToLive
    };
    res.cookie(cookieNames.userName, user.Name, nameCookieOptions);
    res.cookie(cookieNames.userToken, user.Token, isInProduction ? productionTokenCookieOption : tokenCookieOptions);
    //res.status(HttpStatus.OK).json(user);
    res.sendStatus(HttpStatus.OK);
  }
  function getBaseToken(req, res) {
    //logger.debug('base');
    const {username, password} = req.body;
    if (!username || !password) {
      res.status(500).json({error: 'username or password malformed or missing'});
      return;
    }
    const cleanUserName = sanitaze(username);
    const authToken = generateAuthorizationHeader(cleanUserName, password);
    res.json({token: authToken});
  }
  //will use jwt to verification
  function verify(req, res) {
    //logger.debug('verify');
    res.sendStatus(HttpStatus.OK);
  }

  function logout(req, res) {
    //logger.debug('logout');
    Object.keys(cookieNames).forEach(cookieKey => {
      const cookieName = cookieNames[cookieKey];
      res.clearCookie(cookieName);
    });
    res.sendStatus(HttpStatus.OK);
  }

  //************************ */
  //helper functions
  //************************ */

  function getHoursInMilliSeconds(requestedHourCount) {
    return requestedHourCount * 60 * 60 * 1000;
  }
}
