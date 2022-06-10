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
import {getUnitTestRecords} from './test/getrecords';

import {addUUID} from '../marcUtils/marcUtils';
import {v4 as uuid} from 'uuid';

MarcRecord.setValidationOptions({subfieldValues: false});

//-----------------------------------------------------------------------------
// Make this a list. Give the records names meant for menu. Add transform options to list.
// Add handling those to UI

import p2eProfile from './config/print-to-e/';

const profiles = {
  'p2e': p2eProfile
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

  function optDefaults() {
    return {
      type: 'p2e',
      profile: 'KVP',
      format: 'PDF'
    };
  }

  function getProfiles(req, res) {
    logger.debug('Get profiles');
    res.json({
      type: {
        'p2e': 'Painetusta > E-aineistoksi',
        'e2p': 'E-aineistosta > Painetuksi'
      },
      profile: {
        'KVP': 'Kirjastoverkkopalvelut',
        'FENNI': 'Fennica'
      },
      defaults: optDefaults()
    });
  }

  //---------------------------------------------------------------------------
  // Transform records
  //---------------------------------------------------------------------------

  async function doTransform(req, res) { // eslint-disable-line max-statements
    logger.debug(`Transform`);

    const {source, base, exclude, replace, insert} = {
      source: null,
      base: null,
      exclude: {},
      replace: {},
      insert: null,
      ...req.body
    };

    const options = (opts => ({
      ...optDefaults(),
      ...opts,
      LOWTAG: opts?.profile ? opts.profile : 'XXX'
    }))(req.body.options);

    const transformProfile = profiles[options.type];

    //logger.debug(`Options: ${JSON.stringify(options, null, 2)}`);
    //logger.debug(`sourceID: ${source.ID}`);
    //logger.debug(`baseID: ${base.ID}`);
    //logger.debug(`Excluded: ${JSON.stringify(exclude, null, 2)}`);
    //logger.debug(`Replaced: ${JSON.stringify(replace, null, 2)}`);

    //-------------------------------------------------------------------------

    const {sourceRecord, baseRecord, refRecord} = await loadRecords(source, base);

    if (insert && baseRecord.record) { // eslint-disable-line functional/no-conditional-statement
      try {
        const r = new MarcRecord(baseRecord.record);
        r.insertField({...insert, uuid: uuid()});
        baseRecord.record = r; // eslint-disable-line functional/immutable-data
      } catch (e) {
        baseRecord.error = e.toString(); // eslint-disable-line functional/immutable-data
      }
    }

    //logger.debug(`Base record: ${JSON.stringify(baseRecord, null, 2)}`);

    //-------------------------------------------------------------------------

    const resultRecord = getResultRecord(
      sourceRecord.record,
      baseRecord.record
    );
    logger.debug(`Result record: ${JSON.stringify(resultRecord)}`);

    res.json({
      options: req.body.options,
      ...postProcess(sourceRecord, baseRecord, resultRecord, refRecord),
      exclude,
      replace,
      insert: null
    });

    //-------------------------------------------------------------------------
    // Get source & base records
    //-------------------------------------------------------------------------

    // Make: Run "autoexcluder" for new source records.
    // Make: Autoexcluder: run rules to automatically exclude fields, which can be added by user

    async function loadRecords(source, base) {
      const [sourceRecord, baseRecord, refRecord] = await load();

      //logger.debug(`Loaded source: ${JSON.stringify(sourceRecord, null, 2)}`);
      //logger.debug(`Loaded base: ${JSON.stringify(baseRecord, null, 2)}`);

      return {
        sourceRecord: sourceRecord || {},
        baseRecord: baseRecord ? baseRecord : getBase(sourceRecord),
        refRecord
      };

      function getBase(source) { // eslint-disable-line no-unused-vars
        if (!source?.record) {
          return {};
        }
        return {
          ID: '',
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
        if (record?.record) {
          return record;
        }

        if (!record?.ID) {
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
      }

      function preProcess(record) {
        return addUUID(record);
        //return {record};
      }
    }

    //-------------------------------------------------------------------------
    // Get transformed result
    //-------------------------------------------------------------------------

    function getResultRecord(source, base) {
      if (!source || !base) {
        return {};
      }
      //logger.debug(`Source: ${JSON.stringify(source, null, 2)}`);
      //logger.debug(`Base: ${JSON.stringify(base, null, 2)}`);

      return {
        record: merger({
          ...transformProfile,
          reducers: transformProfile.getReducers(options),
          base: removeExcluded(base),
          source: removeExcluded(source)
        })
      };
    }

    function removeExcluded(record) {

      /*
      return record;

      /*/
      return new MarcRecord(
        {
          leader: record.leader,
          fields: record.fields.filter(f => !exclude[f.uuid])
        },
        {subfieldValues: false}
      );

      /**/
    }

    //-------------------------------------------------------------------------
    // Transform postprocess (apply user edits)
    //-------------------------------------------------------------------------

    function postProcess(source, base, result, reference) {
      try {
        return {
          source,
          base,
          transformed: result,
          result: {
            ...result,
            reference,
            //error: 'Error: Hello, world!',
            record: applyEdits(result.record)
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
      if (!record?.fields) {
        return record;
      }
      return new MarcRecord({
        ...record,
        fields: record.fields.map(f => replace[f.uuid] ? replace[f.uuid] : f)
      }).sortFields();
    }
  }
}
