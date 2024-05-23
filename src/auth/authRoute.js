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

export default function (passport, jwtOptions) { // eslint-disable-line no-unused-vars
  const logger = createLogger();
  //logger.debug('Creating auth route');
  const cookieNames = {
    userName: 'melinda-user-name',
    userToken: 'melinda-user-token'
  };

  return new Router()
    //.use(sanitaze)
    .post('/', passport.authenticate(['melinda', 'jwt'], {session: false}), create)
    .get('/verifyBasic', passport.authenticate(['melinda', 'jwt'], {session: false}), verifyBasic)
    .get('/verifyJwt', passport.authenticate(['melinda', 'jwt'], {session: false}), verifyJwt)
    .post('/logout', passport.authenticate(['melinda', 'jwt'], {session: false}), logout)
    .use(handleError);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  //************************ */
  //route functions
  //************************ */

  //login
  function create(req, res) {
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
      httpOnly: false,
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
    res.status(HttpStatus.OK).json(user);
  }

  //verify token (token set to headers and auth checked in app.js, if gets here its ok)
  function verifyBasic(req, res) {
    res.sendStatus(HttpStatus.OK);
  }
  function verifyJwt(req, res) {
    res.sendStatus(HttpStatus.OK);
  }

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
