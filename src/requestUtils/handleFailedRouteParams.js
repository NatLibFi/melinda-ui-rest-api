import httpStatus from 'http-status';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {Error} from '@natlibfi/melinda-commons';
import {version as uuidVersion, validate as uuidValidate} from 'uuid';

const logger = createLogger();

// Middleware for checking named route parameters
// - logs debug info for developer
// - checks app specific route parameters
// - if some named route parameters fail, next is called with http status '400 - Bad request'
export function handleFailedRouteParams(appName) {

  return function (req, res, next) {
    const routeParams = req.params;
    const route = req.baseUrl;

    logger.debug('.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._.-._');
    logger.debug(`Starting route parameter check for app...`);
    logger.debug(`The current route is: ${route}`);
    logger.debug(`All route parameters: ${JSON.stringify(routeParams)}`);

    const failedParams = [
      ...checkArtikkelitRouteParams(routeParams),
      ...checkMuuntajaRouteParams(routeParams),
      ...checkViewerRouteParams(routeParams)
    ]
      .filter(param => !param.value)
      .map(param => param.name);

    if (failedParams.length === 0) {
      logger.debug(`Route parameter check for app ${appName} passed!`);
      return next();
    }

    logger.error(`Failed route parameters: ${failedParams}`);
    const error = new Error(httpStatus.BAD_REQUEST, 'Invalid route parameter');
    next(error);
  };


  function checkArtikkelitRouteParams(routeParams) {
    if (appName !== 'Artikkelit') {
      return [];
    }

    logger.debug(`Sorry, no check available for Artikkelit route parameters: ${JSON.stringify(routeParams)}`);
    return [];
  }


  function checkMuuntajaRouteParams(routeParams) {
    if (appName !== 'Muuntaja') {
      return [];
    }

    logger.debug(`Sorry, no check available for Muuntaja query parameters: ${JSON.stringify(routeParams)}`);
    return [];
  }

  // Checks Viewer app specific route parameters
  //  - possible Viewer route parameter is 'id'
  //  - parameter 'id' is not present in every request
  //  - returns array of objects
  //       - objects have two properties: name and value
  //       - name is string (the route parameter name)
  //       - value is boolean (if the check is passed or not)
  //  - if route parameter is found in request (is defined), it is tested, and value is set true of false
  //  - otherwise check is automatically passed and value is set true
  function checkViewerRouteParams(routeParams) {
    if (appName !== 'Viewer') {
      return [];
    }

    const {id} = routeParams;

    logger.debug(id === undefined ? `No route parameter 'id'` : `Route parameter 'id' is ${id}`);

    return [{name: 'id', value: id ? uuidValidate(id) && uuidVersion(id) === 4 : true}];
  }

}
