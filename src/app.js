import express from 'express';
import httpStatus from 'http-status';
import passport from 'passport';
import cors from 'cors';

import {AlephStrategy} from '@natlibfi/passport-melinda-aleph';
import {MelindaJwtStrategy, verify, cookieExtractor} from '@natlibfi/passport-melinda-jwt';
import {createLogger, createExpressLogger} from '@natlibfi/melinda-backend-commons';
import {Error as ApiError} from '@natlibfi/melinda-commons';

import cookieParser from 'cookie-parser';

import createArtikkelitRoute from './artikkelit/artikkelitRoute';
import createAuthRoute from './auth/authRoute';
import createBibRoute from './bib/bibRoute';
import createMuuntajaRoute from './muuntaja/muuntajaRoute';
import createOntologyRoute from './ontologies/ontologyRoute';
import createRecordRouter from './record/recordRouter';
import createViewerRoute from './viewer/viewerRoute';
import createPingRoute from './utilRoute/statusRoute';
import createNotificationsRoute from './notifications/notificationsRoute';
import {handlePageNotFound} from './requestUtils/handlePageNotFound';


//import fs from 'fs';
import path from 'path';

// From config file
export default async function ({
  httpPort, enableProxy,
  xServiceURL, userLibrary,
  ownAuthzURL, ownAuthzApiKey,
  sruUrl, jwtOptions, melindaApiOptions, restApiParams,
  fintoUrl, notificationMongoUri
}) {
  const logger = createLogger();
  const server = await initExpress();

  // Soft shutdown function
  server.on('close', () => {
    logger.info('Initiating soft shutdown of Melinda REST API');
    // Things that need soft shutdown
  });

  return server;

  // Add async when you need await in route construction
  async function initExpress() { // eslint-disable-line max-statements
    const app = express();

    //logger.debug(`Service URL: ${xServiceURL}`);
    //logger.debug(`User lib: ${userLibrary}`);
    //logger.debug(`Auth URL: ${ownAuthzURL}`);
    //logger.debug(`Auth key: ${ownAuthzApiKey}`);

    app.enable('trust proxy', Boolean(enableProxy));
    app.use(createExpressLogger());

    app.use(cors());

    app.use(cookieParser());

    //login via auth header with token created from username and password
    //strategy name 'melinda'
    //token generation and auth usage in authRoute.js
    passport.use(new AlephStrategy({
      xServiceURL, userLibrary,
      ownAuthzURL, ownAuthzApiKey
    }));

    //strategy name 'jwt'
    //autheticate via 'melinda' named cookie with jwt token
    passport.use(new MelindaJwtStrategy({
      ...jwtOptions,
      secretOrKey: jwtOptions.secretOrPrivateKey,
      jwtFromRequest: cookieExtractor
    }, verify));

    app.use(passport.initialize());

    // Clients
    app.use('/', express.static(path.join(__dirname, 'clients/login/'), {index: 'login.html'}));
    app.use('/artikkelit', express.static(path.join(__dirname, 'clients/artikkelit/'), {index: 'artikkelit.html'}));
    app.use('/common', express.static(path.join(__dirname, 'clients/common/')));
    app.use('/edit', express.static(path.join(__dirname, 'clients/edit/'), {index: 'edit.html'}));
    app.use('/keycloak', express.static(path.join(__dirname, 'clients/keycloakLogin/'), {index: 'keycloakLogin.html'}));
    app.use('/login', express.static(path.join(__dirname, 'clients/login/'), {index: 'login.html'}));
    app.use('/muuntaja', express.static(path.join(__dirname, 'clients/muuntaja/'), {index: 'muuntaja.html'}));
    app.use('/merge', express.static(path.join(__dirname, 'clients/merge/'), {index: 'merge.html'}));
    app.use('/viewer', express.static(path.join(__dirname, 'clients/viewer/'), {index: 'viewer.html'}));

    // REST API
    app.use('/rest/artikkelit', createArtikkelitRoute());
    app.use('/rest/auth', createAuthRoute(passport, jwtOptions));
    app.use('/rest/bib', passport.authenticate('jwt', {session: false}), await createBibRoute(sruUrl));
    app.use('/rest/muuntaja', passport.authenticate('jwt', {session: false}), await createMuuntajaRoute(sruUrl, melindaApiOptions, restApiParams));
    app.use('/rest/ontologies', passport.authenticate('jwt', {session: false}), createOntologyRoute(fintoUrl));
    app.use('/rest/record', passport.authenticate('jwt', {session: false}), createRecordRouter(melindaApiOptions));
    app.use('/rest/viewer', passport.authenticate('jwt', {session: false}), createViewerRoute(melindaApiOptions));
    app.use('/rest/ping', createPingRoute());
    app.use('/rest/notification', createNotificationsRoute(notificationMongoUri));

    // middleware 'handlePageNotFound' is used for catching all the requests for routes not handled by clients or rest api
    // app.all() handles all HTTP request methods and '*' matches all routes
    app.all('*', handlePageNotFound());

    app.use(handleError);

    return app.listen(httpPort, () => logger.log('info', `Started Melinda REST API in port ${httpPort}`));

    function handleError(err, req, res, next) { // eslint-disable-line max-statements
      logger.info('App/handleError');
      if (err) {
        logger.error(err);
        if (err instanceof ApiError) {
          logger.debug(`Responding expected: ${err.status} ${err.payload}`);
          return res.status(err.status).send(err.payload);
        }

        if (req.aborted) {
          logger.debug(`Responding timeout: ${err.status} ${err.payload}`);
          return res.status(httpStatus.REQUEST_TIMEOUT).send(httpStatus['504_MESSAGE']);
        }

        logger.debug(`Responding unexpected: ${err.status} ${err.payload}`);
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
      }

      next();
    }
  }
}
