import {createLogger} from '@natlibfi/melinda-backend-commons';

const logger = createLogger();

// Middleware for checking query parameters
export function handleFailedQueryParams(appName) {

  // eslint-disable-next-line no-unused-vars
  return function (req, res, next) {
    logger.info(`Checking query parameters in ${appName} route!`);
    logger.debug(`Params: ${JSON.stringify(req.query)}`);
    next();
  };
}
