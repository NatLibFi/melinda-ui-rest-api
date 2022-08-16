import express from 'express';
import httpStatus from 'http-status';
import passport from 'passport';
import cors from 'cors';

import AlephStrategy from '@natlibfi/passport-melinda-aleph';
import MelindaJwtStrategy, {verify, jwtFromRequest} from '@natlibfi/passport-melinda-jwt';
import {createLogger, createExpressLogger} from '@natlibfi/melinda-backend-commons';
import {Error as ApiError} from '@natlibfi/melinda-commons';

import createAuthRoute from './auth/authRoute';
import createBibRoute from './bib/bibRoute';
import createRecordRoute from './record/recordRoute';
import createMuuntajaRoute from './muuntaja/muuntajaRoute';
import createViewerRoute from './viewer/viewerRoute';

//import fs from 'fs';
import path from 'path';

// From config file
export default function ({
  httpPort, enableProxy,
  xServiceURL, userLibrary,
  ownAuthzURL, ownAuthzApiKey,
  sruUrl, jwtOptions, melindaApiOptions
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

    //logger.debug(`Service URL: ${xServiceURL}`);
    //logger.debug(`User lib: ${userLibrary}`);
    //logger.debug(`Auth URL: ${ownAuthzURL}`);
    //logger.debug(`Auth key: ${ownAuthzApiKey}`);

    app.enable('trust proxy', Boolean(enableProxy));
    app.use(createExpressLogger());

    const corsOptions = {
      origin: 'https://keycloak-sso.apps.ocp-kk-test-0.k8s.it.helsinki.fi',
      optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    };
    app.use(cors(corsOptions));

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

    // Clients
    app.use('/muuntaja', express.static(path.join(__dirname, 'clients/muuntaja/'), {index: 'muuntaja.html'}));
    app.use('/viewer', express.static(path.join(__dirname, 'clients/viewer/'), {index: 'viewer.html'}));
    app.use('/edit', express.static(path.join(__dirname, 'clients/edit/'), {index: 'edit.html'}));
    app.use('/common', express.static(path.join(__dirname, 'clients/common/')));
    app.use('/keycloak', express.static(path.join(__dirname, 'clients/keycloakLogin/'), {index: 'keycloakLogin.html'}));
    app.use('/login', express.static(path.join(__dirname, 'clients/login/'), {index: 'login.html'}));
    app.use('/', express.static(path.join(__dirname, 'clients/login/'), {index: 'login.html'}));

    // REST API
    app.use('/rest/auth', passport.authenticate(['melinda', 'jwt'], {session: false}), createAuthRoute(jwtOptions));
    app.use('/rest/bib', passport.authenticate(['melinda', 'jwt'], {session: false}), createBibRoute(sruUrl));
    app.use('/rest/record', passport.authenticate(['melinda', 'jwt'], {session: false}), createRecordRoute(sruUrl));
    app.use('/rest/muuntaja', passport.authenticate(['melinda', 'jwt'], {session: false}), createMuuntajaRoute(sruUrl));
    app.use('/rest/viewer', passport.authenticate(['melinda', 'jwt'], {session: false}), createViewerRoute(melindaApiOptions));

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
