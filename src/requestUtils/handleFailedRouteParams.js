import {createLogger} from '@natlibfi/melinda-backend-commons';
import {Error} from '@natlibfi/melinda-commons';
import httpStatus from 'http-status';
import {version as uuidVersion, validate as uuidValidate} from 'uuid';


//*****************************************************************************
// Middleware for checking named route parameters
//*****************************************************************************
// - logs debug info for developer
// - checks app specific route parameters
// - if some named route parameters fail, next is called with http status '400 - Bad request'
//-----------------------------------------------------------------------------
//
export function handleFailedRouteParams(appName) {

  const logger = createLogger();

  return function (req, res, next) {
    const routeParams = req.params;
    const route = req.baseUrl;

    logger.debug('.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._');
    logger.debug(`Starting route parameter check for app...`);
    logger.verbose(`The current route is: ${route}`);
    logger.verbose(`All route parameters: ${JSON.stringify(routeParams)}`);

    const failedParams = [
      ...checkArtikkelitRouteParams(routeParams),
      ...checkMuuntajaRouteParams(routeParams),
      ...checkViewerRouteParams(routeParams)
    ]
      .filter(param => !param.value)
      .map(param => param.name);

    if (failedParams.length === 0) {
      logger.info(`Route parameter check for app ${appName} passed!`);
      logger.debug('.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._');
      return next();
    }

    logger.warn(`Failed route parameters: ${failedParams}`);
    const error = new Error(httpStatus.BAD_REQUEST, 'Invalid route parameter');
    next(error);
  };


  //*****************************************************************************
  // App specific checks for route parameters
  //-----------------------------------------------------------------------------
  //  - every function returns array of objects
  //       - objects have two properties: name and value
  //       - name is string (the route parameter name)
  //       - value is boolean (if the check is passed or not)
  //  - if route parameter is found in request (is defined), it is tested, and value is set true of false
  //  - otherwise check is automatically passed and value is set true
  //-----------------------------------------------------------------------------


  //-----------------------------------------------------------------------------
  // Checks Artikkelit app specific route parameters
  //  - currently just a placeholder
  //
  function checkArtikkelitRouteParams(routeParams) {
    if (appName !== 'Artikkelit') {
      return [];
    }

    logger.debug(`Sorry, no check available for Artikkelit route parameters: ${JSON.stringify(routeParams)}`);
    return [];
  }

  //-----------------------------------------------------------------------------
  // Checks Muuntaja app specific route parameters
  //  - currently just a placeholder
  //
  function checkMuuntajaRouteParams(routeParams) {
    if (appName !== 'Muuntaja') {
      return [];
    }

    logger.debug(`Sorry, no check available for Muuntaja route parameters: ${JSON.stringify(routeParams)}`);
    return [];
  }

  //-----------------------------------------------------------------------------
  // Checks Viewer app specific route parameters
  //  - possible Viewer route parameter is 'id'
  //  - parameter 'id' is not present in every request
  //
  function checkViewerRouteParams(routeParams) {
    if (appName !== 'Viewer') {
      return [];
    }

    const {id} = routeParams;

    logger.verbose(id === undefined ? `No route parameter 'id'` : `Route parameter 'id' is ${id}`);

    return [{name: 'id', value: id ? uuidValidate(id) && uuidVersion(id) === 4 : true}];
  }

}
