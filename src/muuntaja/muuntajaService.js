/******************************************************************************
 *
 * muuntaja service
 *
 ******************************************************************************
 */

/* eslint-disable no-unused-vars */

import merger from '@natlibfi/marc-record-merge';

import {MarcRecord} from '@natlibfi/marc-record';
import {v4 as uuid} from 'uuid';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {profiles} from './config/profiles';
import {validationOff} from './config/common';

export {uuid};

const logger = createLogger();

//-----------------------------------------------------------------------------
// muuntaja service
//-----------------------------------------------------------------------------

export function createMuuntajaService() {

  return {
    generateResultRecord,
    postprocessRecord
  };
}

/******************************************************************************
 *
 * Muuntaja service functions
 *
 ******************************************************************************
 */

function stripRecord({leader, fields, ID, error, notes}) {

  return {
    leader,
    fields,
    ...ID ? {ID} : {},
    ...error ? {error} : {},
    ...notes ? {notes} : {}
  };
}

export function generateResultRecord({source, base: baseRecord, options, insert, exclude, replace}) {
  //logger.debug(`* now in getResultRecord`);
  //logger.debug(`* OPTIONS: ${JSON.stringify(options, null, 2)}`);
  //logger.debug(`* data.options.profile: ${JSON.stringify(data.options.profile, null, 2)}`);
  //logger.debug(`* Source: ${JSON.stringify(source, null, 2)}`);
  //   logger.debug(`* Base: ${JSON.stringify(baseRecord, null, 2)}`);

  try {
    const transformProfile = profiles[options.type];

    const base = baseRecord?.leader ? baseRecord : transformProfile.createBase(options);

    if (!source?.leader || !base?.leader) {
      return {
        source: stripRecord(source),
        base: stripRecord(base),
        result: {}
      };
    }

    try {
      const reducers = transformProfile.getReducers(options);

      //logger.debug(`Reducers: ${JSON.stringify(reducers, null, 2)}`);

      const merged = merger({
        base: asMarcRecord(modifyRecord(base, null, exclude, null)),
        source: asMarcRecord(modifyRecord(source, null, exclude, null)),
        reducers
      });

      //const postprocessed = modifyRecord(merged, insert, null, replace);
      //const result = asMarcRecord(postprocessed).sortFields();
      const result = postprocessRecord(merged, insert, null, replace);

      //logger.debug(`* getResultRecord/result: ${JSON.stringify(result, null, 2)}`);

      return {
        source: stripRecord(source),
        base: stripRecord(base),
        result: stripRecord(result)
      };
    } catch (err) {
      const error = err.toString();
      logger.error(`getResultRecord: Error: ${error}`);
      return {
        source,
        base,
        result: {
          error
        }
      };
    }
  } catch (err) {
    const error = err.toString();
    logger.error(`getResultRecord: Error: ${error}`);
    return {
      source,
      base: baseRecord,
      result: {
        error
      }
    };
  }
}

export function postprocessRecord(record, insert, exclude, replace) {
  try {
    const postprocessed = modifyRecord(record, insert, exclude, replace);
    const result = asMarcRecord(postprocessed).sortFields();
    const stripped = stripRecord(result);

    return {
      ...record,
      ...stripped
    };
  } catch (err) {
    logger.error(`postprocessRecord: Error: ${err}`);
    return {
      ...record,
      error: err.toString()
    };
  }
}

/******************************************************************************
 *
 * Services for record fetching & modifying
 *
 ******************************************************************************
 */

//-----------------------------------------------------------------------------
// Records with field IDs

export async function getRecordWithIDs(bibService, record) {
  //logger.debug(`Record: ${JSON.stringify(record, null, 2)}`);

  if (record?.leader) {
    return record;
  }

  if (!record?.ID) {
    return record;
  }

  const [result] = await bibService.getRecordById(record.ID);
  //logger.debug(`Result: ${JSON.stringify(result, null, 2)}`);
  return {
    ...record,
    ...addMissingIDs(result)
  };
}

//-----------------------------------------------------------------------------
// Validate record and sort its fields
//-----------------------------------------------------------------------------

export function asMarcRecord(record, validationOptions = validationOff) {
  if (!record?.leader) {
    return record;
  }

  try {
    return new MarcRecord(record, validationOptions);
  } catch (err) {
    const error = err.toString();
    logger.error(`AsMarcRecord: Error: ${error}`);
    return {
      error,
      ...record
    };
  }
}

//-----------------------------------------------------------------------------
// Add IDs for tracing fields
//-----------------------------------------------------------------------------

export function addMissingIDs(record) {
  if (!record?.fields) {
    return record;
  }
  return {
    ...record,
    fields: generateMissingIDs(record.fields)
  };
}

export function generateMissingIDs(fields) {
  if (!fields) {
    return [];
  }
  return fields.map(f => f.id ? f : {...f, id: uuid()});
}

//-----------------------------------------------------------------------------
// Record modify services
//-----------------------------------------------------------------------------

export function modifyRecord(record, insert, exclude, replace) {
  if (!record) {
    return null;
  }
  const result = replaceFields(excludeFields(insertFields(record, insert), exclude), replace);

  //logger.debug(`Result: ${JSON.stringify(result, null, 2)}`);

  return result;
}

//-----------------------------------------------------------------------------

export function insertFields(record, fields) {
  if (!fields) {
    return record;
  }

  return {
    ...record,
    fields: [
      ...record?.fields ? record.fields : [],
      ...fields
    ]
  };
}

//-----------------------------------------------------------------------------

export function excludeFields(record, exclude) {
  if (!exclude) {
    return record;
  }

  if (!record?.fields) {
    return record;
  }

  return {
    ...record,
    fields: record.fields.filter(f => !exclude[f.id])
  };
}

//-----------------------------------------------------------------------------

export function replaceFields(record, replace) {
  if (!replace) {
    return record;
  }

  if (!record?.fields) {
    return record;
  }

  return {
    ...record,
    fields: record.fields.map(f => replace[f.id] ? replace[f.id] : f)
  };
}
