/******************************************************************************
 *
 * muuntaja route
 *
 ******************************************************************************
 */

/* eslint-disable no-unused-vars */

import express, {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {createBibMuuntajaService} from '../bib/bibMuuntajaService';
import {handleFailedQueryParams} from '../requestUtils/handleFailedQueryParams';
import {handleFailedRouteParams} from '../requestUtils/handleFailedRouteParams';
import {handleRouteNotFound} from '../requestUtils/handleRouteNotFound';
import {handleError} from '../requestUtils/handleError';

import {createMuuntajaService, getRecordWithIDs, generateMissingIDs, modifyRecord, addMissingIDs, stripFields, bareRecord} from './muuntajaService';

import {promisify} from 'util';

const sleep = promisify(setTimeout);

//setTimeoutPromise(50);

const appName = 'Muuntaja';

//-----------------------------------------------------------------------------

export default function (sruUrl, melindaApiOptions, restApiParams) {
  const logger = createLogger();
  const bibService = createBibMuuntajaService(sruUrl, melindaApiOptions, restApiParams);
  const muuntajaService = createMuuntajaService();

  //logger.debug('Creating muuntaja route');

  return new Router()
    .use(handleFailedQueryParams(appName))
    .use(express.json())
    .get('/profiles', handleFailedRouteParams(appName), getProfiles)
    .post('/transform', handleFailedRouteParams(appName), doTransform)
    .post('/store', handleFailedRouteParams(appName), storeTransformed)
    .use(handleRouteNotFound(appName))
    .use(handleError(appName));

  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // Get available transform profiles
  //---------------------------------------------------------------------------

  function getProfiles(req, res) {
    logger.debug('Get profiles');

    const {user} = req;

    //logger.debug(`User...: ${JSON.stringify(user)}`);
    logger.debug(`User ID......: ${JSON.stringify(user.id)}`);
    logger.debug(`Authorization: ${JSON.stringify(user.authorization)}`);

    res.json({
      type: [
        {tag: 'p2e', name: 'Painetusta > E-aineistoksi'},
        {tag: 'e2p', name: 'E-aineistosta > Painetuksi'},
        {tag: 'merge', name: 'Yhdistä tietueet'}
      ],
      profile: [

        //*
        {tag: 'DEFAULT', name: 'Oletus'},
        {tag: 'FENNI', name: 'Fennica'}

        /*/
        ...user.authorization.map(org => organizationToProfile(org))

        /**/
      ]
    });

    function organizationToProfile(org) {
      const profiles = {
        'KVP': {tag: 'KVP', name: 'Kirjastoverkkopalvelut'},
        'FENNI': {tag: 'FENNI', name: 'Fennica'}
      };

      if (org in profiles) {
        return profiles[org];
      }
      return {tag: org, name: org};
    }
  }

  //---------------------------------------------------------------------------
  // Strip errors & notes from incoming transform request records
  //---------------------------------------------------------------------------

  function stripTransformInfoFields(transform) {

    function stripRecordErrors(record) {
      if (!record) {
        return undefined;
      }
      return {
        ...record.ID ? {ID: record.ID} : {},
        ...record.leader ? {leader: record.leader} : {},
        ...record.fields ? {fields: record.fields} : {}
      };
    }

    return {
      ...transform,
      source: stripRecordErrors(transform.source),
      base: stripRecordErrors(transform.base),
      result: stripRecordErrors(transform.result),
      stored: stripRecordErrors(transform.stored)
    };
  }

  //---------------------------------------------------------------------------
  // Get transform options
  //---------------------------------------------------------------------------

  function getTransformOptions(transform) {

    if (!transform.options) {
      return {};
    }

    return {
      type: transform.options.type,
      profile: getProfileByOrganization(transform.options.profile),
      LOWTAG: transform.options.profile
    };

    function getProfileByOrganization(org) {
      if (org === 'FENNI') {
        return 'FENNI';
      }
      return;
    }
  }

  //---------------------------------------------------------------------------
  // Process user data for record transform
  //---------------------------------------------------------------------------

  // Make: Run "autoexcluder" for new source records.
  // Make: Autoexcluder: run rules to automatically exclude fields, which can be added by user

  async function doTransform(req, res) { // eslint-disable-line max-statements
    logger.debug(`Transform`);

    //-------------------------------------------------------------------------
    // Strip incoming records and fill defaults

    const transform = stripTransformInfoFields(req.body);

    const options = getTransformOptions(transform);

    const {source, base, exclude, replace, stored} = {
      exclude: {},
      replace: {},
      ...transform
    };

    const insert = generateMissingIDs(transform.insert);

    //-------------------------------------------------------------------------
    // If we have already stored the record, do modifications, but do not do transformation

    if (stored) {
      const result = muuntajaService.postprocessRecord(stored, insert, exclude, replace);

      res.json({
        options: req.body.options,
        source, base,
        exclude,
        replace,
        insert,
        stored,
        result
      });

      return;
    }

    //logger.debug(`transformProfile: ${transformProfile}`);

    //logger.debug(`Options[muuntajaRoute]: ${JSON.stringify(options, null, 2)}`);
    //logger.debug(`sourceID: ${source.ID}`);
    //logger.debug(`baseID: ${base.ID}`);
    //logger.debug(`Excluded: ${JSON.stringify(exclude, null, 2)}`);
    //logger.debug(`Replaced: ${JSON.stringify(replace, null, 2)}`);

    //-------------------------------------------------------------------------
    // Load source & base if needed

    const [sourceRecord, baseRecord] = await load(source, base);

    //-------------------------------------------------------------------------
    // Create result record from source & base, according to options

    const result = muuntajaService.generateResultRecord({
      source: sourceRecord,
      base: baseRecord,
      options,
      exclude,
      replace,
      insert
    });
    //logger.debug(`Result record: ${JSON.stringify(result)}`);

    res.json({
      ...result,
      options: transform.options,
      exclude,
      replace,
      insert
    });

    //-------------------------------------------------------------------------
    // Get source & base records
    //-------------------------------------------------------------------------

    function load(source, base) {
      return Promise.all([
        fetchRecord(source),
        fetchRecord(base)
      ]);
    }

    function fetchRecord(record) {
      logger.debug(`Fetching: ID=${record?.ID}`);
      //logger.debug(`Record: ${JSON.stringify(record)}`);

      return getRecordWithIDs(bibService, record);
    }
  }

  //---------------------------------------------------------------------------
  // Store result record
  //---------------------------------------------------------------------------

  async function storeTransformed(req, res) { // eslint-disable-line max-statements
    logger.debug(`Store`);

    const {user} = req;
    const transformed = stripTransformInfoFields(req.body);

    const {options, source, base, stored, result} = transformed;

    if (!result) {
      res.json(transformed);
      return;
    }

    const {ID} = result;

    logger.debug(`Storing: ID=${JSON.stringify(ID)}`);
    //logger.debug(`User...: ${JSON.stringify(user)}`);

    try {
      //logger.debug(`Record to store: ${JSON.stringify(bare, null, 2)}`);

      const response = await storeRecord(user, ID, result);

      res.json({
        options,
        source: stripFields(source),
        base: stripFields(base),
        ...await getStoredRecord(response, stored, result)
      });
    } catch (err) {
      logger.error(`storeTransformed: ${JSON.stringify(err)}`);
      res.json({
        ...transformed,
        result: {
          ...result,
          error: err.toString()
        }
      });
    }
  }

  // First, create or update the record, and get the response

  function storeRecord(user, ID, record) {
    // Strip all extra info from record to be stored
    const bare = bareRecord(record);
    if (ID) {
      return bibService.updateOne(ID, bare, user?.id, restApiParams);
    }
    return bibService.createOne(bare, user?.id, restApiParams);
  }

  // Second, get the updated record from database

  async function getStoredRecord(response, stored, result) {
    //logger.debug('Waiting...');
    //await sleep(1000);
    logger.debug('Retrieving updated record');

    try {
      // Dummy search to prevent yaz to return cached record
      await bibService.getRecordById('999999998');
      const updated = await bibService.getRecordById(response.ID);
      //const updated = await bibService.getUpdated(response.ID);

      //logger.debug(`Updated: ${JSON.stringify(updated)}`);

      const withIDs = {
        ...response,
        ...addMissingIDs(updated)
      };

      return {
        stored: withIDs,
        result: withIDs
      };
    } catch (err) {
      return {
        stored,
        result: {
          ...response,
          ...result
        }
      };
    }
  }
}
