import {createLogger} from '@natlibfi/melinda-backend-commons';

const logger = createLogger();

export function handleRouteNotFound(appName) {

  // eslint-disable-next-line no-unused-vars
  return function (req, res, next) {
    const {path, query, method} = req;
    logger.error(`Error: it seems that this ${appName} route is not found!`);
    logger.debug(`Request method: ${method} | Path: ${path} | Query strings: ${JSON.stringify(query)}`);
    res.sendStatus(404);
  };

}
