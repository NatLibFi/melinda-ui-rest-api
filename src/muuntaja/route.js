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
import {v4 as uuid} from 'uuid';

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

    const {source, base, excluded} = req.body;

    logger.debug(`sourceID: ${source.ID}`);
    logger.debug(`baseID: ${base.ID}`);
    logger.debug(`Excluded: ${excluded}`);
    // validate source, validate base

    const transformProfile = profiles.p2e.kvp;

    const [sourceRecord, baseRecord] = await Promise.all([
      getRecord(source.ID),
      getRecord(base.ID, transformProfile.baseRecord)
    ]);
    //logger.debug(`Source record: ${JSON.stringify(sourceRecord)}`);

    const resultRecord = await getResultRecord(
      sourceRecord.record,
      baseRecord.record
    );
    //logger.debug(`Result record: ${JSON.stringify(resultRecord)}`);

    // What we want: (1) determine, which fields in the result record comes from
    // which input record. Mark them.

    res.json({
      source: removeUnusedUUID(sourceRecord, resultRecord),
      base: removeUnusedUUID(baseRecord, resultRecord),
      result: resultRecord,
      excluded: {}
    });

    async function getRecord(id, _default = null) {
      if (!id) {
        return {record: addUUID(_default)};
      }
      try {
        return {record: addUUID(await getRecordByID(id))};
      } catch (e) {
        return {error: e};
      }
    }

    function getResultRecord(source, base) {
      if (!source) {
        return null;
      }
      return transformRecord(logger, transformProfile, source, base);
    }

    function decorate(record, tag) { // eslint-disable-line
      if (!record) {
        return null;
      }
      return {
        leader: record.leader,
        fields: record.fields.map(f => ({...f, ...tag}))
      };
    }

    function removeProperty(propKey, {[propKey]: propValue, ...rest}) { // eslint-disable-line
      return rest;
    }

    function addUUID(record) { // eslint-disable-line
      if (!record) {
        return null;
      }
      return {
        leader: record.leader,
        fields: record.fields.map(f => ({...f, uuid: uuid()}))
      };
    }

    function removeUnusedUUID(record, result) { // eslint-disable-line
      if (!record.record) {
        return null;
      }

      const uuids = result.record.fields.map(f => f.uuid);
      //logger.debug(`UUIDs: ${uuids}`);

      return {
        ...record,
        record: {
          ...record.record,
          fields: record.record.fields.map(f => uuids.includes(f.uuid) ? f : removeProperty('uuid', f))
        }
      };
    }
  }
}

//-----------------------------------------------------------------------------

// Osakohteet (pidä mielessä)

// Recordin käsittely:
// https://github.com/NatLibFi/marc-record-merge-js/tree/next/src/reducers
