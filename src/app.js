import express from 'express';
import httpStatus from 'http-status';
import passport from 'passport';
import cors from 'cors';

import AlephStrategy from '@natlibfi/passport-melinda-aleph';
import MelindaJwtStrategy, {verify, jwtFromRequest} from '@natlibfi/passport-melinda-jwt';
import {createLogger, createExpressLogger} from '@natlibfi/melinda-backend-commons';
import {Error as ApiError} from '@natlibfi/melinda-commons';
import {createAuthRouter, createBibRouter, createRecordRouter, createMuuntajaRouter} from './routes';

//import {createMuuntajaRouter} from './muuntaja/route';
//import fs from 'fs';
import path from 'path';

// From config file
export default function ({
  httpPort, enableProxy,
  xServiceURL, userLibrary,
  ownAuthzURL, ownAuthzApiKey,
  sruUrl, jwtOptions
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
  function initExpress() { // eslint-disable-line max-statements
    const app = express();

    logger.debug(`Service URL: ${xServiceURL}`);
    logger.debug(`User lib: ${userLibrary}`);
    logger.debug(`Auth URL: ${ownAuthzURL}`);
    logger.debug(`Auth key: ${ownAuthzApiKey}`);

    app.enable('trust proxy', Boolean(enableProxy));
    app.use(createExpressLogger());
    app.use(cors());

    passport.use(new AlephStrategy({
      xServiceURL, userLibrary,
      ownAuthzURL, ownAuthzApiKey
    }));

    passport.use(new MelindaJwtStrategy({
      ...jwtOptions,
      secretOrKey: jwtOptions.secretOrPrivateKey,
      jwtFromRequest
    }, verify));

    app.use(passport.initialize());

    // REST API
    app.use('/rest/auth', passport.authenticate(['melinda', 'jwt'], {session: false}), createAuthRouter(jwtOptions));
    app.use('/rest/bib', passport.authenticate(['melinda', 'jwt'], {session: false}), createBibRouter(sruUrl));
    app.use('/rest/record', passport.authenticate(['melinda', 'jwt'], {session: false}), createRecordRouter(sruUrl));
    app.use('/rest/muuntaja', passport.authenticate(['melinda', 'jwt'], {session: false}), createMuuntajaRouter(sruUrl));

    // Clients
    app.use('/test', express.static(path.join(__dirname, 'clients/test'), {index: 'testclient.html'}));
    app.use('/muuntaja', express.static(path.join(__dirname, 'clients/muuntaja/'), {index: 'muuntaja.html'}));
    app.use('/viewer', express.static(path.join(__dirname, 'clients/viewer/'), {index: 'viewer.html'}));
    app.use('/edit', express.static(path.join(__dirname, 'clients/edit/'), {index: 'edit.html'}));
    app.use('/common', express.static(path.join(__dirname, 'clients/common/')));
    app.use('/', express.static(path.join(__dirname, 'clients/login/'), {index: 'login.html'}));

    app.use(handleError);

    return app.listen(httpPort, () => logger.log('info', `Started Melinda REST API in port ${httpPort}`));

    function handleError(err, req, res, next) { // eslint-disable-line max-statements
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
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
      }

      next();
    }
  }
}
