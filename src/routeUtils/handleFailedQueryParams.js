import httpStatus from 'http-status';
import {createLogger} from '@natlibfi/melinda-backend-commons';

const logger = createLogger();

// Middleware for checking query parameters
export function handleFailedQueryParams(appName) {

  // eslint-disable-next-line no-unused-vars
  return function (req, res, next) {
    const queryParams = req.query;

    logger.debug(`Checking query params in ${appName} route!`);
    logger.debug(`All query parameters: ${JSON.stringify(queryParams)}`);

    const failedParams = ['test failed parameter'];

    if (failedParams.length === 0) {
      logger.debug('Query parameters OK!');
      return next();
    }

    logger.error(`Failed query parameters: ${failedParams}`);
    res.sendStatus(httpStatus.BAD_REQUEST);
  };
}
