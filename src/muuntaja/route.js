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
import {getRecordByID} from '../bib/bib';

//import mergeProfiles from './print-to-e';
//import {baseRecord} from './print-to-e/target-record';
//import {printToE} from './config/config-presets';

//-----------------------------------------------------------------------------
// Make this a list. Give the records names meant for menu. Add transform options to list.
// Add handling those to UI

import p2eDefaultProfile from './config/print-to-e/default';
//import {preset as MergeValidationPreset} from './marc-record-merge-validate-service';
//import {preset as PostMergePreset} from './marc-record-merge-postmerge-service';
//import {baseRecord as p2eDefaultBase} from './config/print-to-e/target-record';

const profiles = {
  'p2e': {
    'kvp': {
      //'baseRecord': p2eDefaultBase,
      //'validationRules': MergeValidationPreset.melinda_host,
      //'postMergeFixes': PostMergePreset.defaults,
      'baseRecord': p2eDefaultProfile.record.targetRecord,
      'validationRules': p2eDefaultProfile.record.validationRules,
      'postMergeFixes': p2eDefaultProfile.record.postMergeFixes,
      'mergeConfiguration': p2eDefaultProfile.record.mergeConfiguration,
      'newFields': p2eDefaultProfile.record.newFields
    }
  }
};

/*
const defaultPreset = {
  default: mergeProfiles.default
};

export const printToE = {
  mergeType: 'printToE',
  baseRecord,
  'defaults': defaultPreset,
  'aleph': mergeProfiles,
  'kvp': mergeProfiles,
  'fenni': {
    'default': mergeProfiles.default,
    'fennica': mergeProfiles.fennica,
    'legal_deposit': mergeProfiles.legal_deposit
  },
  'selma': defaultPreset,
  'halti': defaultPreset
};
*/

//-----------------------------------------------------------------------------

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

    const transformProfile = profiles.p2e.kvp;

    const [sourceRecord, baseRecord] = await Promise.all([
      getRecord(sourceID),
      getRecord(baseID, transformProfile.baseRecord)
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
