/******************************************************************************
 *
 * muuntaja route
 *
 ******************************************************************************
 */

/* eslint-disable no-unused-vars */

import express, {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {createBibService} from '../bib/bibService';
import {handleFailedQueryParams} from '../requestUtils/handleFailedQueryParams';
import {handleFailedRouteParams} from '../requestUtils/handleFailedRouteParams';
import {handleRouteNotFound} from '../requestUtils/handleRouteNotFound';
import {handleError} from '../requestUtils/handleError';

import {profiles} from './config/profiles';
import {createMuuntajaService, getRecordWithIDs, generateMissingIDs, modifyRecord, asMarcRecord} from './muuntajaService';

const appName = 'Muuntaja';

//-----------------------------------------------------------------------------

export default async function (sruUrl) {
  const logger = createLogger();
  const bibService = await createBibService(sruUrl);
  const muuntajaService = createMuuntajaService();

  const optDefaults = {
    type: 'p2e',
    profile: 'KVP',
    format: ''
  };

  //logger.debug('Creating muuntaja route');

  return new Router()
    .use(handleFailedQueryParams(appName))
    .use(express.json())
    .get('/profiles', handleFailedRouteParams(appName), getProfiles)
    .post('/transform', handleFailedRouteParams(appName), doTransform)
    .use(handleRouteNotFound(appName))
    .use(handleError(appName));

  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // Get available transform profiles
  //---------------------------------------------------------------------------

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
      defaults: optDefaults
    });
  }

  //---------------------------------------------------------------------------
  // Process user data for record transform
  //---------------------------------------------------------------------------

  async function doTransform(req, res) { // eslint-disable-line max-statements
    logger.debug(`Transform`);

    const {source, base, include, exclude, replace} = {
      source: null,
      base: null,
      include: null,
      exclude: {},
      replace: {},
      ...req.body
    };

    const options = (opts => ({
      ...optDefaults,
      ...opts,
      LOWTAG: opts?.profile ?? 'XXX'
    }))(req.body.options);

    const transformProfile = profiles[options.type];

    //logger.debug(`Options[muuntajaRoute]: ${JSON.stringify(options, null, 2)}`);
    //logger.debug(`sourceID: ${source.ID}`);
    //logger.debug(`baseID: ${base.ID}`);
    //logger.debug(`Excluded: ${JSON.stringify(exclude, null, 2)}`);
    //logger.debug(`Replaced: ${JSON.stringify(replace, null, 2)}`);

    //-------------------------------------------------------------------------

    //const include = generateMissingIDs(req.body.include ?? []);

    const {sourceRecord, baseRecord} = await loadRecords(source, base);

    //-------------------------------------------------------------------------

    const resultRecord = muuntajaService.getResultRecord({
      profile: transformProfile,
      source: sourceRecord,
      base: baseRecord,
      options,
      exclude,
      replace,
      include: generateMissingIDs(include)
    });
    //logger.debug(`Result record: ${JSON.stringify(resultRecord)}`);

    res.json({
      options: req.body.options,
      ...postProcess(sourceRecord, baseRecord, resultRecord),
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
      const [sourceRecord, baseRecord] = await load();

      //logger.debug(`Loaded source: ${JSON.stringify(sourceRecord, null, 2)}`);
      //logger.debug(`Loaded base: ${JSON.stringify(baseRecord, null, 2)}`);

      return {
        sourceRecord,
        baseRecord: modifyRecord(getBase(baseRecord, sourceRecord), include, null, null)
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
    // Transform postprocess (apply user edits)
    //-------------------------------------------------------------------------

    function postProcess(source, base, result) {
      return {
        source: asMarcRecord(source),
        base: asMarcRecord(base),
        result: asMarcRecord(modifyRecord(result, null, null, replace))
      };
    }
  }
}
