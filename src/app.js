import express from 'express';
import httpStatus from 'http-status';
import passport from 'passport';
import AlephStrategy from '@natlibfi/passport-melinda-aleph';
import {createLogger, createExpressLogger} from '@natlibfi/melinda-backend-commons';
import {Error as ApiError} from '@natlibfi/melinda-commons';
import {createBibRouter} from './routes';

// From config file
export default function ({
  httpPort, enableProxy,
  xServiceURL, userLibrary,
  ownAuthzURL, ownAuthzApiKey,
  sruUrl
}) {
  const logger = createLogger();
  const server = initExpress();

  // Soft shutdown function
  server.on('close', () => {
    logger.log('info', 'Initiating soft shutdown of Melinda REST API');
    // Things that need soft shutdown
  });

  return server;

  // Add async when you need await in route construction
  function initExpress() {
    const app = express();

    app.enable('trust proxy', Boolean(enableProxy));
    app.use(createExpressLogger());

    passport.use(new AlephStrategy({
      xServiceURL, userLibrary,
      ownAuthzURL, ownAuthzApiKey
    }));

    app.use(passport.initialize());
    app.use('/bib', createBibRouter(sruUrl)); // Must be here to avoid bodyparser
    app.use(handleError);

    return app.listen(httpPort, () => logger.log('info', `Started Melinda REST API in port ${httpPort}`));

    function handleError(err, req, res, next) {
      logger.log('info', 'App/handleError');
      if (err) {
        logger.error(err);
        if (err instanceof ApiError) {
          logger.log('debug', 'Responding expected');
          return res.status(err.status).send(err.payload);
        }

        if (req.aborted) {
          logger.log('debug', 'Responding timeout');
          return res.status(httpStatus.REQUEST_TIMEOUT).send(httpStatus['504_MESSAGE']);
        }

        logger.log('debug', 'Responding unexpected');
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
      }

      next();
    }
  }
}
