import {createLogger} from '@natlibfi/melinda-backend-commons';

const logger = createLogger();

// Middleware for checking query parameters
export function handleFailedQueryParams(appName) {

  // eslint-disable-next-line no-unused-vars
  return function (req, res, next) {
    const queryParams = req.query;

    logger.debug(`Checking query parameters in ${appName} route!`);
    logger.debug(`Params: ${JSON.stringify(queryParams)}`);

    const failedParams = [];

    if (failedParams.length === 0) {
      logger.debug('Query parameters OK!');
      return next();
    }

    return next();
  };
}
