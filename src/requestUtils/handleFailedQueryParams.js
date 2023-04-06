/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-expressions */

import httpStatus from 'http-status';
import {createLogger} from '@natlibfi/melinda-backend-commons';

const logger = createLogger();

// Middleware for checking query string parameters
export function handleFailedQueryParams(appName) {

  // eslint-disable-next-line no-unused-vars
  return function (req, res, next) {
    const queryParams = req.query;

    logger.debug(`Starting query parameter check for app...`);
    logger.debug(`All query parameters: ${JSON.stringify(queryParams)}`);

    const failedParams = [];
    checkQueryParams(queryParams);

    if (failedParams.length === 0) {
      logger.debug(`${appName} query parameters OK!`);
      return next();
    }

    logger.error(`Failed query parameters: ${failedParams}`);
    res.sendStatus(httpStatus.BAD_REQUEST);
  };

  function checkQueryParams(queryParams) {
    logger.debug(`Checking now ${appName} query parameters...`);

    const sequence = queryParams.sequence;
    const force = queryParams.force;
    const expanded = queryParams.expanded;

    sequence === undefined ? logger.debug(`No query parameter 'sequence'!`) : logger.debug(`Query parameter 'sequence' is ${sequence}`);
    force === undefined ? logger.debug(`No query parameter 'force'!`) : logger.debug(`Query parameter 'force' is ${force}`);
    expanded === undefined ? logger.debug(`No query parameter 'expanded'!`) : logger.debug(`Query parameter 'expanded' is ${expanded}`);
  }

}
