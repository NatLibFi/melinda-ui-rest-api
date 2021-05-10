import {Router} from 'express';
import passport from 'passport';
import {createLogger} from '@natlibfi/melinda-backend-commons';

export default function (sruUrl) {
  const logger = createLogger();

  return new Router()
    .use(passport.authenticate('melinda', {session: false}))
    .get('/', testFunction);

  function testFunction(req, res) {
    logger.log('debug', req.user);
    logger.log('debug', sruUrl);
    res.json('{"status": "ok"}');
  }
}
