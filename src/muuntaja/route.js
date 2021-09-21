/******************************************************************************
 *
 * Services for muuntaja
 *
 ******************************************************************************
 */

import express, {Router} from 'express';
//import HttpStatus from 'http-status';
//import {Error as APIError} from '@natlibfi/melinda-commons';
import {createLogger} from '@natlibfi/melinda-backend-commons';
//import defaults from 'defaults';
//import createClient from '@natlibfi/sru-client';
//import {MARCXML} from '@natlibfi/marc-record-serializers';
import {transformRecord} from './transform';
import {getRecordByID} from '../common/common';
import {printToE} from './config/config-presets';

// https://github.com/NatLibFi/marc-record-serializers

// Make this a list. Give the records names meant for menu. Add transform options to list.
// Add handling those to UI

/* Base records have two parts:
   1. defaults, which fill possible missing fields in source record, and
   2. overwrites, which overwrite fields in source record.
*/

export default function (jwtOptions) { // eslint-disable-line no-unused-vars
  const logger = createLogger();
  logger.debug('Creating muuntaja route');

  return new Router()
    //.get('/base', getBaseRecords)
    .use(express.json())
    .post('/transform', doTransform)
    .use(handleError);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  async function doTransform(req, res) { // eslint-disable-line max-statements
    logger.debug(`Transform`);

    const {sourceID, baseID} = req.body;

    logger.debug(`sourceID: ${sourceID}`);
    logger.debug(`baseID: ${baseID}`);
    // validate source, validate base

    const transformType = printToE;
    //const transformProfile = transformType.defaults.default.record;
    const transformProfile = transformType.kvp.default.record;

    const [sourceRecord, baseRecord] = await Promise.all([
      getRecord(sourceID),
      getRecord(baseID, transformProfile.targetRecord)
    ]);
    //logger.debug(`Source record: ${JSON.stringify(sourceRecord)}`);

    res.json({
      source: {
        //error: 'Not found',
        record: sourceRecord
      },
      base: {
        record: baseRecord
      },
      result: await getResultRecord(sourceRecord, baseRecord)
    });

    function getRecord(id, _default = null) {
      if (!id) {
        return _default;
      }
      return getRecordByID(id);
    }

    function getResultRecord(source, base) {
      if (!source) {
        return null;
      }
      return transformRecord(logger, transformProfile, source, base);
    }
  }
}

//-----------------------------------------------------------------------------

// Jos base on haettu kannasta, niin ID säilyy

// Osakohteet (pidä mielessä)

// Recordin käsittely:
// https://github.com/NatLibFi/marc-record-merge-js/tree/next/src/reducers
