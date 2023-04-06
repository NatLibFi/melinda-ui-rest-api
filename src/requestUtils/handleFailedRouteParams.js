/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-expressions */

import httpStatus from 'http-status';
import {createLogger} from '@natlibfi/melinda-backend-commons';

const logger = createLogger();

// Middleware for checking named route parameters
export function handleFailedRouteParams(appName) {

  return function (req, res, next) {
    const routeParams = req.params;

    logger.debug(`Starting route parameter check for app...`);
    logger.debug(`All named route parameters: ${JSON.stringify(routeParams)}`);

    const failedParams = [];
    checkRouteParams(routeParams);

    if (failedParams.length === 0) {
      logger.debug(`${appName} route parameters OK!`);
      return next();
    }

    logger.error(`Failed route parameters: ${failedParams}`);
    res.sendStatus(httpStatus.BAD_REQUEST);
  };

  function checkRouteParams(routeParams) {
    logger.debug(`Checking now ${appName} route parameters...`);

    const id = routeParams.id;

    id === undefined ? logger.debug(`No query parameter 'id'!`) : logger.debug(`Query parameter 'id' is ${id}`);
  }

}
