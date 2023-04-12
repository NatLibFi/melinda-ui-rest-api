import httpStatus from 'http-status';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {Error} from '@natlibfi/melinda-commons';

const logger = createLogger();

// Middleware for checking query string parameters
export function handleFailedQueryParams(appName) {

  return function (req, res, next) {
    const queryParams = req.query;
    const route = req.baseUrl;

    logger.debug('.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._');
    logger.debug(`Starting query parameter check for app ${appName}...`);
    logger.debug(`The current route is: ${route}`);
    logger.debug(`All query parameters: ${JSON.stringify(queryParams)}`);

    const failedParams = [
      ...checkArtikkelitQueryParams(queryParams),
      ...checkMuuntajaQueryParams(queryParams),
      ...checkViewerQueryParams(queryParams)
    ]
      .filter(param => !param.value)
      .map(param => param.name);

    if (failedParams.length === 0) {
      logger.debug(`Query parameter check for app ${appName} passed!`);
      return next();
    }

    logger.error(`Failed query parameters: ${failedParams}`);
    const error = new Error(httpStatus.BAD_REQUEST, 'Invalid query parameter');
    next(error);
  };


  function checkArtikkelitQueryParams(queryParams) {
    if (appName !== 'Artikkelit') {
      return [];
    }

    logger.debug(`Sorry, no check available for Artikkelit query parameters: ${JSON.stringify(queryParams)}`);
    return [];
  }


  function checkMuuntajaQueryParams(queryParams) {
    if (appName !== 'Muuntaja') {
      return [];
    }

    logger.debug(`Sorry, no check available for Muuntaja query parameters: ${JSON.stringify(queryParams)}`);
    return [];
  }


  function checkViewerQueryParams(queryParams) {
    if (appName !== 'Viewer') {
      return [];
    }

    const {sequence, force, expanded} = queryParams;

    logger.debug(sequence === undefined ? `No query parameter 'sequence'` : `Query parameter 'sequence' is ${sequence}`);
    logger.debug(force === undefined ? `No query parameter 'force'` : `Query parameter 'force' is ${force}`);
    logger.debug(expanded === undefined ? `No query parameter 'expanded'` : `Query parameter 'expanded' is ${expanded}`);

    return [
      {name: 'sequence', value: sequence ? (/^(?:[0-9]{1,3})$/u).test(sequence) : true},
      {name: 'force', value: force ? (/^(?:1|0|true|false)$/ui).test(force) : true},
      {name: 'expanded', value: expanded ? (/^(?:1|0|true|false)$/ui).test(expanded) : true}
    ];
  }

}
