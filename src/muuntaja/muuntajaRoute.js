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
        {tag: 'e2p', name: 'E-aineistosta > Painetuksi'}
      ],
      profile: user.authorization.map(org => organizationToProfile(org))
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

  function stripInformationFields(transform) {

    function stripRecordErrors(record) {
      return {
        ...record,
        notes: undefined,
        error: undefined
      };
    }
    return {
      ...transform,
      ...transform.source ? stripRecordErrors(transform.source) : {},
      ...transform.base ? stripRecordErrors(transform.base) : {},
      ...transform.result ? stripRecordErrors(transform.result) : {},
      ...transform.stored ? stripRecordErrors(transform.stored) : {}
    };
  }

  //---------------------------------------------------------------------------
  // Process user data for record transform
  //---------------------------------------------------------------------------

  // Make: Run "autoexcluder" for new source records.
  // Make: Autoexcluder: run rules to automatically exclude fields, which can be added by user

  async function doTransform(req, res) { // eslint-disable-line max-statements
    logger.debug(`Transform`);

    const transform = stripInformationFields(req.body);

    const {source, base, insert, exclude, replace, stored} = {
      source: null,
      base: null,
      insert: [],
      exclude: {},
      replace: {},
      ...transform
    };

    const fieldsToInsert = generateMissingIDs(insert);

    if (stored) {
      const modified = muuntajaService.postprocessRecord(stored, fieldsToInsert, exclude, replace);

      res.json({
        source, base,
        options: req.body.options,
        exclude,
        replace,
        insert: fieldsToInsert,
        stored,
        result: modified
      });

      return;
    }

    const options = {
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

    //logger.debug(`transformProfile: ${transformProfile}`);

    //logger.debug(`Options[muuntajaRoute]: ${JSON.stringify(options, null, 2)}`);
    //logger.debug(`sourceID: ${source.ID}`);
    //logger.debug(`baseID: ${base.ID}`);
    //logger.debug(`Excluded: ${JSON.stringify(exclude, null, 2)}`);
    //logger.debug(`Replaced: ${JSON.stringify(replace, null, 2)}`);

    //-------------------------------------------------------------------------

    //const include = generateMissingIDs(req.body.include ?? []);

    const [sourceRecord, baseRecord] = await load(source, base);
    //const {sourceRecord, baseRecord} = await loadRecords(source, base);

    //-------------------------------------------------------------------------

    const result = muuntajaService.generateResultRecord({
      source: sourceRecord,
      base: baseRecord,
      options,
      exclude,
      replace,
      insert: fieldsToInsert
    });
    //logger.debug(`Result record: ${JSON.stringify(result)}`);

    res.json({
      ...result,
      options: transform.options,
      exclude,
      replace,
      insert: fieldsToInsert
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
    const transformed = stripInformationFields(req.body);

    const {options, source, base, stored, result} = transformed;

    if (!result) {
      res.json(transformed);
      return;
    }

    //const ID = '017735845';
    const {ID} = result;

    logger.debug(`Storing: ID=${JSON.stringify(ID)}`);
    logger.debug(`User...: ${JSON.stringify(user)}`);

    try {
      const bare = bareRecord(result);

      logger.debug(`Record to store: ${JSON.stringify(bare, null, 2)}`);

      const response = await storeRecord(user, ID, bare);

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
    if (ID) {
      return bibService.updateOne(ID, record, user?.id, restApiParams);
    }
    return bibService.createOne(record, user?.id, restApiParams);
  }

  // Second, get the updated record from database

  async function getStoredRecord(response, stored, result) {
    try {
      //const updated = await melindaRestApiClient.read(id);
      //const updated = await bibService.getRecordById(response.ID);
      const updated = await bibService.getUpdated(response.ID);

      logger.debug(`Updated: ${JSON.stringify(updated)}`);

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
