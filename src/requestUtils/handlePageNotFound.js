import {createLogger} from '@natlibfi/melinda-backend-commons';
import path from 'path';

const logger = createLogger();

// Middleware for catching pages that do not exist
// - logs debug info for developer
// - sends http error '404 - Not found' with custom "Sorry, page not found" -page in response
export function handlePageNotFound() {

  // eslint-disable-next-line no-unused-vars
  return function (req, res, next) {
    logger.error(`Error: it seems that this page is not found!`);
    logger.debug(`Request method: ${req.method} | Path: ${req.path} | Query parameters: ${JSON.stringify(req.query)}`);
    res.status(404).sendFile(path.join(__dirname, '../clients/common/templates', 'pageNotFound.html'));
  };
}
