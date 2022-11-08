/******************************************************************************
 *
 * Services for record fetching & modifying
 *
 ******************************************************************************
 */

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';
import {v4 as uuid} from 'uuid';
import {getRecordByID} from '../bib/bibService';
import {createLogger} from '@natlibfi/melinda-backend-commons';

export {uuid};

const logger = createLogger();

//-----------------------------------------------------------------------------
// Records with field IDs

export async function getRecordWithIDs(bibService, record) {
  //logger.debug(`Record: ${JSON.stringify(record, null, 2)}`);
  const result = await fetch(record);
  //logger.debug(`Result: ${JSON.stringify(record, null, 2)}`);
  return {
    ...record,
    ...addMissingIDs(result)
  };

  function fetch(record) {
    if (record?.leader) {
      return record;
    }
    if (!record?.ID) {
      return record;
    }
    return bibService.getRecordByID(record.ID);
  }
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
