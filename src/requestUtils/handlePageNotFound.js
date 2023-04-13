import {createLogger} from '@natlibfi/melinda-backend-commons';

const logger = createLogger();

// Middleware for catching pages that do not exist
export function handlePageNotFound() {

  const pageNotFoundHtml = '<h3>Valitettavasti etsimääsi sivua ei löytynyt!</h3> <p><a href="/">Siirry etusivulle sisällysluetteloon</a> tai <a href="javascript: window.history.back()">palaa edelliselle sivulle</a>.</p';

  // eslint-disable-next-line no-unused-vars
  return function (req, res, next) {
    const {path, query, method} = req;
    logger.error(`Error: it seems that this page is not found!`);
    logger.debug(`Request method: ${method} | Path: ${path} | Query parameters: ${JSON.stringify(query)}`);
    res.status(404).send(pageNotFoundHtml);
  };
}
