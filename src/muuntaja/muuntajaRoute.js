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
import {getRecordWithIDs, generateMissingIDs, modifyRecord, asMarcRecord} from '../record/recordService';
import {getUnitTestRecords} from './test/getrecords';
import {createBibService} from '../bib/bibService';
import {handleFailedQueryParams} from '../requestUtils/handleFailedQueryParams';

const appName = 'Muuntaja';

MarcRecord.setValidationOptions({subfieldValues: false});

//-----------------------------------------------------------------------------
// Make this a list. Give the records names meant for menu. Add transform options to list.
// Add handling those to UI

import p2eProfile from './config/print-to-e';
import e2pProfile from './config/e-to-print';

const profiles = {
  'p2e': p2eProfile,
  'e2p': e2pProfile
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

export default async function (sruUrl) { // eslint-disable-line no-unused-vars
  const logger = createLogger();
  const bibService = await createBibService(sruUrl);

  //logger.debug('Creating muuntaja route');

  return new Router()
    .use(handleFailedQueryParams(appName))
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
    //logger.debug('Get profiles');
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

    const {source, base, exclude, replace} = {
      source: null,
      base: null,
      exclude: {},
      replace: {},
      ...req.body
    };

    const include = generateMissingIDs(req.body.include);

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

    //const include = generateMissingIDs(req.body.include ?? []);

    const {sourceRecord, baseRecord, refRecord} = await loadRecords(source, base);

    //-------------------------------------------------------------------------

    const resultRecord = getResultRecord(
      sourceRecord,
      baseRecord
    );
    //logger.debug(`Result record: ${JSON.stringify(resultRecord)}`);

    res.json({
      options: req.body.options,
      ...postProcess(sourceRecord, baseRecord, resultRecord, refRecord),
      exclude,
      replace,
      include: []
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
        sourceRecord,
        baseRecord: modifyRecord(getBase(baseRecord, sourceRecord), include, null, null),
        refRecord
      };

      function getBase(base, source) { // eslint-disable-line no-unused-vars
        if (base?.leader) {
          return base;
        }
        if (!source?.leader) {
          return base;
        }
        return {
          ...base,
          ...transformProfile.createBase(source, options)
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

      function fetchRecord(record) {
        try {
          logger.debug('Fetching...');
          //logger.debug(`Record: ${JSON.stringify(record)}`);
          return getRecordWithIDs(bibService, record);
        } catch (e) {
          return {
            ...record,
            error: e.toString()
          };
        }
      }
    }

    //-------------------------------------------------------------------------
    // Get transformed result
    //-------------------------------------------------------------------------

    function getResultRecord(source, base) {
      if (!source?.leader || !base?.leader) {
        return {};
      }
      //logger.debug(`Source: ${JSON.stringify(source, null, 2)}`);
      //logger.debug(`Base: ${JSON.stringify(base, null, 2)}`);

      return merger({
        ...transformProfile,
        reducers: transformProfile.getReducers(options),
        source: modifyRecord(source, null, exclude, null),
        base: modifyRecord(base, null, exclude, null)
      });
    }

    //-------------------------------------------------------------------------
    // Transform postprocess (apply user edits)
    //-------------------------------------------------------------------------

    function postProcess(source, base, result, reference) {
      return {
        source: asMarcRecord(source),
        base: asMarcRecord(base),
        transformed: result,
        result: asMarcRecord(modifyRecord(result, null, null, replace)),
        reference
      };
    }
  }
}
