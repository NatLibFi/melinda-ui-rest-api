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
import {sanitizeString} from './authService.js';

// https://github.com/NatLibFi/marc-record-serializers

export default function (passport, jwtOptions) { // eslint-disable-line no-unused-vars
  const logger = createLogger();
  //logger.debug('Creating auth route');

  //expected cookie name for jwt token is from passport-melinda-jwt-js cookieExtractor function,
  //set to be used in app.js MelindaJwtStrategy jwtFromRequest
  const cookieNames = {
    userToken: 'melinda'
  };

  /**
   * 'melinda' is passport-melinda-aleph-js projects extended basic authentication strategy, used in app.js as AlephStrategy for passport auth
   * 'jwt' is refering passport-melinda-jwt-js projects extended JwtStrategy, used in app.js as MelindaJwtStrategy for passport auth,
   *
   * 'melinda' looks for 'Authorization' header with token
   * 'jwt' looks for token from cookie named 'melinda', cookie should be 'httpOnly:true' so clientside scripts cant use it
   */
  return new Router()
    //.use(sanitaze)
    .use(express.json())
    .post('/getBaseToken', getBaseToken)
    .post('/login', passport.authenticate('melinda', {session: false}), login)
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

  //login with base auth token, generate proper jwt token to cookie and return user
  function login(req, res) {
    // Strip files
    //token itself is valid 120h
    const {id, authorization} = req.user;
    const displayName = getAuthUserDisplayName(req);
    const jwtToken = generateJwtToken({displayName, id, authorization}, jwtOptions);

    //set required data to cookie with proper options
    const isInProduction = process.env.NODE_ENV === 'production';// eslint-disable-line
    //cookie age in hours
    const cookieAgeDevelopment = 12;
    const cookieAgeProduction = 9;
    const cookieAge = getHoursInMilliSeconds(isInProduction ? cookieAgeDevelopment : cookieAgeProduction);

    const tokenCookieOptions = {
      httpOnly: true,
      SameSite: 'None',
      secure: isInProduction,
      maxAge: cookieAge
    };
    res.cookie(cookieNames.userToken, jwtToken, tokenCookieOptions);

    res.status(HttpStatus.OK).json({name: displayName});
  }
  //sanitize user login data and try to generate base auth token
  function getBaseToken(req, res) {
    const {username, password} = req.body;
    if (!username || !password) {
      res.status(500).json({error: 'username or password malformed or missing'});
      return;
    }
    try {
      const cleanUserName = sanitizeString({value: username, options: {allowedPattern: 'a-zA-Z0-9_\\-äöåÄÖÅ'}});
      const authToken = generateAuthorizationHeader(cleanUserName, password);

      res.json({token: authToken});
    } catch (error) {
      res.status(500).json({error: 'Failed to either process user info or generate token.'});
    }
  }
  //will use jwt token in cookie for verification, returns some user data
  function verify(req, res) {
    res.status(HttpStatus.OK).json({name: getAuthUserDisplayName(req)});
  }
  //clear relevant tokens upon logout
  function logout(req, res) {
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

/**
* Make sure authenticated user does have some name available, even if some data is not filled in to user account
*
* @param {object} req request, that should have user field
* @returns {string}
*/
export function getAuthUserDisplayName(req) {
  return req.user.displayName || req.user.id || 'melinda-user';
}
