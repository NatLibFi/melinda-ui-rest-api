/* eslint-disable no-unused-vars */

import {createLogger} from '@natlibfi/melinda-backend-commons';
import httpStatus from 'http-status';


//*****************************************************************************
// Middleware for catching a route that does not exist
//*****************************************************************************
// - logs error and debug info for developer
// - sends http status '404 - Not found' response forward
// - middleware is taken in use after all the other app routes
// - middleware catches only 404 responses, which are not errors in express
//-----------------------------------------------------------------------------
//
export function handleRouteNotFound(appName) {

  const logger = createLogger();

  return function (req, res, next) {
    const {path, query, method} = req;
    logger.error(`Error: it seems that this ${appName} route is not found!`);
    logger.debug(`Request method: ${method} | Path: ${path} | Query parameters: ${JSON.stringify(query)}`);
    res.sendStatus(httpStatus.NOT_FOUND);
  };

}
