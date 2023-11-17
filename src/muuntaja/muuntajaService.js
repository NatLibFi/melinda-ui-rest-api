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

export {uuid};

const logger = createLogger();

//-----------------------------------------------------------------------------
// muuntaja service
//-----------------------------------------------------------------------------

export function createMuuntajaService() {

  return {
    getResultRecord
  };
}

/******************************************************************************
 *
 * Muuntaja service functions
 *
 ******************************************************************************
 */

function stripRecord({ID, leader, fields}) {
  if (ID) {
    return {ID, leader, fields};
  }
  return {leader, fields};
}

export function getResultRecord({source, base: baseRecord, options, include, exclude, replace}) {
  //logger.debug(`* now in getResultRecord`);
  //logger.debug(`* OPTIONS: ${JSON.stringify(options, null, 2)}`);
  //logger.debug(`* data.options.profile: ${JSON.stringify(data.options.profile, null, 2)}`);
  //logger.debug(`* Source: ${JSON.stringify(source, null, 2)}`);
  // logger.debug(`* Base: ${JSON.stringify(base, null, 2)}`);

  const transformProfile = profiles[options.type];

  const base = baseRecord?.leader ? baseRecord : transformProfile.createBase(options);

  if (!source?.leader || !base?.leader) {
    return {
      source: stripRecord(source),
      base: stripRecord(base),
      result: {}
    };
  }

  const reducers = transformProfile.getReducers(options);

  const result = merger({
    base: modifyRecord(base, null, exclude, null),
    source: modifyRecord(source, null, exclude, null),
    reducers
  });

  // logger.debug(`* getResultRecord/result: ${JSON.stringify(result, null, 2)}`);

  return {
    source: stripRecord(source),
    base: stripRecord(base),
    result: stripRecord(asMarcRecord(modifyRecord(result, null, null, replace)))
  };
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

export function asMarcRecord(record, validationOptions = {}) {
  if (!record?.leader) {
    return record;
  }

  try {
    return {
      ...record,
      fields: MarcRecord.clone(record, validationOptions).sortFields().fields
    };
  } catch (e) {
    return {
      error: e.toString(),
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
    return fields;
  }
  return fields.map(f => f.id ? f : {...f, id: uuid()});
}

//-----------------------------------------------------------------------------
// Record modify services
//-----------------------------------------------------------------------------

export function modifyRecord(record, include, exclude, replace) {
  if (!record) {
    return null;
  }
  const result = replaceFields(excludeFields(includeFields(record, include), exclude), replace);

  //logger.debug(`Result: ${JSON.stringify(result, null, 2)}`);

  return result;
}

//-----------------------------------------------------------------------------

export function includeFields(record, fields) {
  if (!fields) {
    return record;
  }

  return {
    ...record,
    fields: [
      ...record?.fields ? record.fields : [],
      ...generateMissingIDs(fields)
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
