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
import {asMarcRecord, generateMissingIDs, getRecordWithIDs, modifyRecord} from './recordService';
//import createClient from '@natlibfi/sru-client';
//import {MARCXML} from '@natlibfi/marc-record-serializers';

// https://github.com/NatLibFi/marc-record-serializers

export default function (jwtOptions) { // eslint-disable-line no-unused-vars
  const logger = createLogger();

  return new Router()
    .use(express.json())
    .post('/modify', modify)
    //.post('/verify', verify)
    //.post('/', create)
    .use(handleError);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  async function modify(req, res) {
    const {source, exclude, replace} = {
      source: null,
      exclude: {},
      replace: {},
      ...req.body
    };

    const include = generateMissingIDs(req.body.include ?? []);

    const fetched = await getRecordWithIDs(source);
    const result = getResult(fetched);

    res.json({
      source: fetched,
      result: asMarcRecord(result),
      include,
      exclude,
      replace
    });

    function getResult(record) {
      if (!record?.fields) {
        return record;
      }

      return modifyRecord(record, include, exclude, replace);
    }
  }

  /*
  function create(req, res) {
    // Strip files
    const user = {
      Name: req.user.displayName,
      Token: generateJwtToken(req.user, jwtOptions)
    };

    res
      .status(HttpStatus.OK)
      .json(user);
  }

  function verify(req, res) {
    res.sendStatus(HttpStatus.OK);
  }
  */
}
