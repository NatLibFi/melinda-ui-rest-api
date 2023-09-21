import httpStatus from 'http-status';
import {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';

export default function createPingRoute() {// eslint-disable-line no-unused-vars
  const logger = createLogger();

  return new Router()
  .use('/', ping)

  function ping() {
    logger.log('info', `statusRoute/ping, httpStatus: ${httpStatus.OK}`);
    return httpStatus.OK.end();
  }
}