/******************************************************************************
 *
 * Services for muuntaja
 *
 ******************************************************************************
 */

import express, {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {MarcRecord} from '@natlibfi/marc-record';
import {fieldOrderComparator} from './marc-field-sort';
import merger from '@natlibfi/marc-record-merge';
import {getRecordByID} from '../bib/bib';
import {getUnitTestRecords} from './test/getrecords';
import {addUUID} from './marc-record-utils';

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
  // Get available transform profiles
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
  // Transform records
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

    const options = {
      format: 'PDF',
      LOW: 'KVP'
    };

    //-------------------------------------------------------------------------

    const {sourceRecord, baseRecord, refRecord} = await loadRecords(source, base);

    //logger.debug(`Base record: ${JSON.stringify(baseRecord, null, 2)}`);

    //-------------------------------------------------------------------------

    const resultRecord = getResultRecord(
      sourceRecord.record,
      baseRecord.record
    );
    //logger.debug(`Result record: ${JSON.stringify(resultRecord)}`);

    res.json({
      profile,
      ...postProcess(sourceRecord, baseRecord, resultRecord, refRecord),
      exclude,
      replace
    });

    //-------------------------------------------------------------------------
    // Get source & base records
    //-------------------------------------------------------------------------

    async function loadRecords(source, base) {
      const [sourceRecord, baseRecord, refRecord] = await load();

      //logger.debug(`Loaded source: ${JSON.stringify(sourceRecord, null, 2)}`);
      //logger.debug(`Loaded base: ${JSON.stringify(baseRecord, null, 2)}`);

      return {
        sourceRecord,
        baseRecord: baseRecord || getBase(sourceRecord),
        refRecord
      };

      function getBase(source) { // eslint-disable-line no-unused-vars
        return {
          record: transformProfile.createBase(source.record, options)
        };
      }

      function load() {
        if (source.ID.startsWith('/')) {
          return getUnitTestRecords(source.ID);
        }
        return Promise.all([
          fetchRecord(source),
          fetchRecord(base)
        ]);
      }

      async function fetchRecord(record) {
        if (record.record) {
          return record;
        } else if (!record.ID) {
          return null;
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
    // Get transformed result
    //-------------------------------------------------------------------------

    function getResultRecord(source, base) {
      if (!source || !base) {
        return {};
      }
      try {
        return {
          record: merger({
            ...transformProfile,
            reducers: transformProfile.getReducers(options),
            base: removeExcluded(base),
            source: removeExcluded(source)
          })
        };
      } catch (e) {
        return {error: e.toString()};
      }
    }

    function removeExcluded(record) {
      return new MarcRecord({
        leader: record.leader,
        fields: record.fields.filter(f => !exclude[f.uuid])
      });
    }

    //-------------------------------------------------------------------------
    // Transform postprocess (apply user edits)
    //-------------------------------------------------------------------------

    function postProcess(source, base, result, reference) {
      try {
        const edited = applyEdits(result.record);
        const sorted = sortFields(edited); // eslint-disable-line no-unused-vars

        return {
          source,
          base,
          transformed: result,
          result: {
            ...result,
            reference,
            //error: 'Error: Hello, world!',
            record: edited
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

    function sortFields(record) {
      if (!record || !record.fields) {
        return record;
      }
      return {
        ...record,
        fields: record.fields.slice().sort(fieldOrderComparator)
      };
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

  }
}
