/* eslint-disable no-unused-vars */

import {createLogger} from '@natlibfi/melinda-backend-commons';
import {Error} from '@natlibfi/melinda-commons';
import httpStatus from 'http-status';


//*****************************************************************************
// Middleware for catching errors occuring in route handlers and in other middlewares
//*****************************************************************************
// - logs error and debug info for developer
// - if error is of custom class Error, sends that error status code and error message forward in response
// - if error has status code, code is send forward in response
// - otherwise sends forward error status code '500 - Internal server error'
// - middleware is taken in use as last after all routes and other middleware
//-----------------------------------------------------------------------------
//
export function handleError(appName) {

  const logger = createLogger();

  return function (err, req, res, next) {
    logger.debug(`Error: ${err}`);
    logger.error(`Error in ${appName} route! [error status code: ${err.status} | error message: ${err.payload}]`);

    if (err instanceof Error) {
      logger.debug(`Sending the received httpError '${err.status} - ${httpStatus[err.status]}' with message '${err.payload}' forward`);
      return res.status(err.status).send(err.payload);
    }

    if (err.status) {
      logger.debug(`Sending the received error status code '${err.status} - ${httpStatus[err.status]}' forward`);
      return res.sendStatus(err.status);
    }

    logger.debug(`No status code received in error, sending code '500 - Internal server error' instead`);
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  };

}
