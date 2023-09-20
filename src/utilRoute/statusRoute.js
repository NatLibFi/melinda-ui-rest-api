import httpStatus from 'http-status';
import {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';

export default function createPingRoute() {// eslint-disable-line no-unused-vars
  const logger = createLogger();

  logger.log('info', `----------     statusRoute.js/httpStatus.OK: ${httpStatus.OK}`)

  return new Router()
  .use('/', ping)

  function ping() {
    logger.log('info', `-------  This comes from statusRoute.js / PING`)
    return httpStatus.OK;        
  }

}
