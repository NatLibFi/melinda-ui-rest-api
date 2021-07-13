import express from 'express';
import httpStatus from 'http-status';
import passport from 'passport';
import AlephStrategy from '@natlibfi/passport-melinda-aleph';
import {createLogger, createExpressLogger} from '@natlibfi/melinda-backend-commons';
import {Error as ApiError} from '@natlibfi/melinda-commons';
import {createBibRouter, createAuthRouter} from './routes';
//import fs from 'fs';
import path from 'path';

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
    logger.info('Initiating soft shutdown of Melinda REST API');
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

    logger.debug(`Service URL: ${xServiceURL}`);
    logger.debug(`User lib: ${userLibrary}`);
    logger.debug(`Auth URL: ${ownAuthzURL}`);
    logger.debug(`Auth key: ${ownAuthzApiKey}`);

    app.use(passport.initialize());
    app.use('/auth', createAuthRouter());
    app.use('/bib', createBibRouter(sruUrl));
    app.use('/test', express.static(path.join(__dirname, 'testclient/'), {index: 'testclient.html'}));
    app.use('/muuntaja', express.static(path.join(__dirname, 'muuntaja/'), {index: 'muuntaja.html'}));
    app.use(handleError);

    return app.listen(httpPort, () => logger.log('info', `Started Melinda REST API in port ${httpPort}`));

    function handleError(err, req, res, next) {
      logger.info('App/handleError');
      if (err) {
        logger.error(err);
        if (err instanceof ApiError) {
          logger.debug('Responding expected:', err);
          return res.status(err.status).send(err.payload);
        }

        if (req.aborted) {
          logger.debug('Responding timeout:', err);
          return res.status(httpStatus.REQUEST_TIMEOUT).send(httpStatus['504_MESSAGE']);
        }

        logger.debug('Responding unexpected:', err);
        return res.send(httpStatus.INTERNAL_SERVER_ERROR);
      }

      next();
    }
  }
}
