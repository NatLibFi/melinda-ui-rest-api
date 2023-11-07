import {createLogger} from '@natlibfi/melinda-backend-commons';
import {Error} from '@natlibfi/melinda-commons';
import httpStatus from 'http-status';


//*****************************************************************************
// Middleware for checking query string parameters
//*****************************************************************************
// - logs debug info for developer
// - checks app specific query parameters
// - if some query parameters fail, next is called with http status '400 - Bad request'
//-----------------------------------------------------------------------------
//
export function handleFailedQueryParams(appName) {

  const logger = createLogger();

  return function (req, res, next) {
    const queryParams = req.query;
    const route = req.baseUrl;

    logger.debug('.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._');
    logger.debug(`Starting query parameter check for app ${appName}...`);
    logger.verbose(`The current route is: ${route}`);
    logger.verbose(`All query parameters: ${JSON.stringify(queryParams)}`);

    const failedParams = [
      ...checkArtikkelitQueryParams(queryParams),
      ...checkMuuntajaQueryParams(queryParams),
      ...checkViewerQueryParams(queryParams)
    ]
      .filter(param => !param.value)
      .map(param => param.name);

    if (failedParams.length === 0) {
      logger.info(`Query parameter check for app ${appName} passed!`);
      logger.debug('.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._');
      return next();
    }

    logger.warn(`Failed query parameters: ${failedParams}`);
    const error = new Error(httpStatus.BAD_REQUEST, 'Invalid query parameter');
    next(error);
  };


  //*****************************************************************************
  // App specific checks for query parameters
  //-----------------------------------------------------------------------------
  //  - every function returns array of objects
  //       - objects have two properties: name and value
  //       - name is string (the query parameter name)
  //       - value is boolean (if the check is passed or not)
  //  - if query parameter is found in request (is defined), it is tested, and value is set true of false
  //  - otherwise check is automatically passed and value is set true
  //-----------------------------------------------------------------------------

  //-----------------------------------------------------------------------------
  // Checks Artikkelit app specific query parameters
  //  - currently just a placeholder
  //
  function checkArtikkelitQueryParams(queryParams) {
    if (appName !== 'Artikkelit') {
      return [];
    }

    logger.debug(`Sorry, no check available for Artikkelit query parameters: ${JSON.stringify(queryParams)}`);
    return [];
  }

  //-----------------------------------------------------------------------------
  // Checks Muuntaja app specific query parameters
  //  - currently just a placeholder
  //
  function checkMuuntajaQueryParams(queryParams) {
    if (appName !== 'Muuntaja') {
      return [];
    }

    logger.debug(`Sorry, no check available for Muuntaja query parameters: ${JSON.stringify(queryParams)}`);
    return [];
  }

  //-----------------------------------------------------------------------------
  // Checks Viewer app specific query parameters
  //  - possible Viewer query parameters are sequence, force and expanded
  //  - not all parameters are present in every request
  //
  function checkViewerQueryParams(queryParams) {
    if (appName !== 'Viewer') {
      return [];
    }

    const {sequence, force, expanded, logItemTypes} = queryParams;

    logger.verbose(sequence === undefined ? `No query parameter 'sequence'` : `Query parameter 'sequence' is ${sequence}`);
    logger.verbose(force === undefined ? `No query parameter 'force'` : `Query parameter 'force' is ${force}`);
    logger.verbose(expanded === undefined ? `No query parameter 'expanded'` : `Query parameter 'expanded' is ${expanded}`);
    logger.verbose(logItemTypes === undefined ? `No query parameter 'logItemTypes'` : `Query parameter 'logItemTypes' is ${logItemTypes}`);


    const validLogItemTypes = ['MATCH_LOG', 'MERGE_LOG'];

    return [
      {name: 'sequence', value: sequence ? (/^(?:[0-9]{1,3})$/u).test(sequence) : true},
      {name: 'force', value: force ? (/^(?:1|0|true|false)$/ui).test(force) : true},
      {name: 'expanded', value: expanded ? (/^(?:1|0|true|false)$/ui).test(expanded) : true},
      {name: 'logItemTypes', value: logItemTypes ? testQueryParameter(logItemTypes, validLogItemTypes) : true}
    ];
  }

  function testQueryParameter(queryParameter, validValues) {
    // eslint-disable-next-line functional/no-let
    let allValid = true;
    const queryParameterValuesAsArray = queryParameter.split(',');

    function isValid(valueToTest) {
      return validValues.some((validValue) => valueToTest === validValue);
    }

    queryParameterValuesAsArray.forEach(queryParameterValue => {
      // eslint-disable-next-line functional/no-conditional-statements
      if (!isValid(queryParameterValue)) {
        logger.debug(`Not a valid query parameter value: ${queryParameterValue}`);
        allValid = false;
      }
    });

    return allValid;
  }


}


