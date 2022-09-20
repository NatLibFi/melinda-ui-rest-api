/******************************************************************************
 *
 * Record fetching and modifying for UIs
 *
 ******************************************************************************
 */

/* eslint-disable no-unused-vars */

import HttpStatus from 'http-status';
import express, {Router} from 'express';
import {generateJwtToken} from '@natlibfi/passport-melinda-jwt';
//import {Error as APIError} from '@natlibfi/melinda-commons';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {createArtikkelitService} from './artikkelitService';
import bodyParser from 'body-parser';

//import createClient from '@natlibfi/sru-client';
//import {MARCXML} from '@natlibfi/marc-record-serializers';

// https://github.com/NatLibFi/marc-record-serializers

export default function () { // eslint-disable-line no-unused-vars
  const logger = createLogger();
  const artikkelitService = createArtikkelitService();

  return new Router()
    .post('/', bodyParser.text({limit: '5MB', type: '*/*'}), generateMarc)
    .use(handleError);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  function generateMarc(req, res, next) {
    try {
      const data = JSON.parse(req.body);
      logger.debug(data);
      const record = artikkelitService.generateRecord(data);
      logger.verbose('publication generated...');

      res.json({record});
    } catch (error) {
      console.log(error); // eslint-disable-line
      return next(error);
    }
  }
}
