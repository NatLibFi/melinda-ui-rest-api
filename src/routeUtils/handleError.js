import {createLogger} from '@natlibfi/melinda-backend-commons';
import httpStatus from 'http-status';
import {Error as HttpError} from '@natlibfi/melinda-commons';

const logger = createLogger();

// eslint-disable-next-line no-unused-vars
export function handleError(err, req, res, next) {
  logger.error(`Error: ${err}`);
  logger.debug(`Error: viewerRoute.js [error status code: ${err.status} | error message: ${err.payload}]`);

  if (err instanceof HttpError) {
    logger.debug(`Sending the received httpError '${err.status} - ${httpStatus[err.status]}' with message '${err.payload}' forward`);
    return res.status(err.status).send(err.payload);
  }

  if (err.status) {
    logger.debug(`Sending the received error status code '${err.status} - ${httpStatus[err.status]}' forward`);
    return res.sendStatus(err.status);
  }

  logger.debug(`No status code received in error, sending code '500 - Internal server error' instead`);
  return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
}
