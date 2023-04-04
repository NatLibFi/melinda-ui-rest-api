import {createLogger} from '@natlibfi/melinda-backend-commons';

const logger = createLogger();

// eslint-disable-next-line no-unused-vars
export function handleRouteNotFound(req, res, next) {
  const {path, query, method} = req;
  logger.error(`Error: it seems that this Viewer route is not found!`);
  logger.debug(`Request method: ${method} | Path: ${path} | Query strings: ${JSON.stringify(query)}`);
  res.sendStatus(404);
}
