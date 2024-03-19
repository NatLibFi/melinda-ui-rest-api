/* eslint-disable no-unused-vars */

import {createLogger} from '@natlibfi/melinda-backend-commons';
import httpStatus from 'http-status';
import path from 'path';


//*****************************************************************************
// Middleware for catching pages that do not exist
//*****************************************************************************
// - logs debug info for developer
// - sends http error '404 - Not found' with custom "Sorry, page not found" -page in response
//-----------------------------------------------------------------------------
//
export function handlePageNotFound() {

  const logger = createLogger();

  return function (req, res, next) {
    logger.warn(`Error: it seems that this page is not found!`);
    logger.verbose(`Request method: ${req.method} | Path: ${req.path} | Query parameters: ${JSON.stringify(req.query)}`);
    res.status(httpStatus.NOT_FOUND).sendFile(path.join(__dirname, '../clients/common/templates', 'pageNotFound.html'));
  };

}
