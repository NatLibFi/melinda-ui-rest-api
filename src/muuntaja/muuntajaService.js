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

function getResultRecord(data) {
  const {profile, source, base, options, include, exclude, replace} = data;

  if (!source?.leader || !base?.leader) {
    return {};
  }
  //logger.debug(`Source: ${JSON.stringify(source, null, 2)}`);
  //logger.debug(`Base: ${JSON.stringify(base, null, 2)}`);

  return merger({
    ...profile,
    reducers: profile.getReducers(options),
    source: modifyRecord(source, null, exclude, null),
    base: modifyRecord(base, null, exclude, null)
  });
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

export function modifyRecord(source, include, exclude, replace) {
  if (!source) {
    return null;
  }
  const result = replaceFields(excludeFields(includeFields(source, include), exclude), replace);

  //logger.debug(`Result: ${JSON.stringify(result, null, 2)}`);
  //logger.debug(`Result: ${JSON.stringify(result)}`);

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

export function replaceFields(record, replace) { // eslint-disable-line
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
