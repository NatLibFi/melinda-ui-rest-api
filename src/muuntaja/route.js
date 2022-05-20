/******************************************************************************
 *
 * Services for muuntaja
 *
 ******************************************************************************
 */

import express, {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {MarcRecord} from '@natlibfi/marc-record';
import merger from '@natlibfi/marc-record-merge';
import {getRecordByID} from '../bib/bib';
import {v4 as uuid} from 'uuid';
import {readFile} from 'fs/promises';

//-----------------------------------------------------------------------------
// Make this a list. Give the records names meant for menu. Add transform options to list.
// Add handling those to UI

import p2eDefaultProfile from './config/print-to-e/default';

const profiles = {
  'p2e': {
    'kvp': p2eDefaultProfile
  }
};

/*
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
    .use(express.json())
    .get('/profiles', getProfiles)
    .post('/transform', doTransform)
    .use(handleError);

  //---------------------------------------------------------------------------

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  //---------------------------------------------------------------------------

  function getProfiles(req, res) {
    logger.debug('Get profiles');
    res.json({
      'types': {
        'p2e': 'Painetusta > E-aineistoksi',
        'e2p': 'E-aineistosta > Painetuksi'
      }
    });
  }

  //---------------------------------------------------------------------------

  async function doTransform(req, res) { // eslint-disable-line max-statements
    logger.debug(`Transform`);

    const profile = req.body.profile ? req.body.profile : 'p2e';
    const {source, base, exclude, replace} = req.body;

    //logger.debug(`Profile: ${profile}`);
    //logger.debug(`sourceID: ${source.ID}`);
    //logger.debug(`baseID: ${base.ID}`);
    //logger.debug(`Excluded: ${JSON.stringify(exclude, null, 2)}`);
    //logger.debug(`Replaced: ${JSON.stringify(replace, null, 2)}`);

    const transformProfile = profiles[profile].kvp;

    //-------------------------------------------------------------------------

    const [sourceRecord, baseRecord] = await loadRecords(source, base, transformProfile.base);
    //logger.debug(`Source record: ${JSON.stringify(sourceRecord, null, 2)}`);

    //-------------------------------------------------------------------------

    const resultRecord = getResultRecord(
      sourceRecord.record,
      baseRecord.record
    );
    //logger.debug(`Result record: ${JSON.stringify(resultRecord)}`);

    res.json({
      profile,
      ...postProcess(sourceRecord, baseRecord, resultRecord),
      exclude,
      replace
    });

    //-------------------------------------------------------------------------

    async function loadRecords(source, base, baseDefault) {
      if (source.ID === '?1') {
        return [
          await loadRecord('./src/muuntaja/test/01/source.json'),
          await loadRecord('./src/muuntaja/test/01/base.json', baseDefault)
        ];
      }
      return Promise.all([
        fetchRecord(source),
        fetchRecord(base, baseDefault)
      ]);

      async function loadRecord(filename, _default = null) {
        try {
          return JSON.parse(await readFile(filename));
        } catch (e) {
          if (_default) {
            return {record: _default};
          }
          return {error: e.toString()};
        }
      }

      async function fetchRecord(record, _default = null) {
        if (record.record) {
          return record;
        } else if (!record.ID) {
          return {
            ID: record.ID,
            record: preProcess(_default)
          };
        }
        try {
          logger.debug('Fetching...');
          //logger.debug(`Record: ${JSON.stringify(record)}`);
          return {
            ID: record.ID,
            record: preProcess(await getRecordByID(record.ID))
          };
        } catch (e) {
          return {error: e.toString()};
        }

        function preProcess(record) {
          return addUUID(record);
          //return {record};
        }
      }
    }

    //-------------------------------------------------------------------------

    function getResultRecord(source, base) {
      if (!source || !base) {
        return {};
      }
      //try {
      return {
        record: merger({
          ...transformProfile,
          base: removeExcluded(base),
          source: removeExcluded(source)
        })
      };
    }

    /*
    } catch (e) {
      return {error: e.toString()};
    }*/

    function removeExcluded(record) {
      return new MarcRecord({
        leader: record.leader,
        fields: record.fields.filter(f => !exclude[f.uuid])
      });
    }

    function postProcess(source, base, result) {
      try {
        return {
          source,
          base,
          transformed: result,
          result: {
            ...result,
            //error: 'Error: Hello, world!',
            record: new MarcRecord(applyEdits(result.record))
            //record: applyEdits(result.record)
          }
        };
      } catch (e) {
        return {
          source,
          base,
          transformed: result,
          result: {
            error: e.toString()
          }
        };
      }
    }

    function applyEdits(record) { // eslint-disable-line
      if (!record || !record.fields) {
        return record;
      }
      return {
        ...record,
        fields: record.fields.map(f => replace[f.uuid] ? replace[f.uuid] : f)
      };
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

    // Add missing UUIDs for tracing fields
    function addUUID(record) { // eslint-disable-line
      if (!record) {
        return null;
      }
      return {
        leader: record.leader,
        fields: record.fields.map(f => {
          if (!f.uuid) {
            return {...f, uuid: uuid()};
          }
          return f;
        })
      };
    }
  }
}

//-----------------------------------------------------------------------------

// Osakohteet (pidä mielessä)

// Recordin käsittely:
// https://github.com/NatLibFi/marc-record-merge-js/tree/next/src/reducers
