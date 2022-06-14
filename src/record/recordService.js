/******************************************************************************
 *
 * Services for record fetching & modifying
 *
 ******************************************************************************
 */

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';
import {v4 as uuid} from 'uuid';

export {uuid};

//-----------------------------------------------------------------------------
// Would be better to use structure:
//
// record {
//   id: ...
//   record: { leader, fields }
//   error: ...
// }
//
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Add IDs for tracing fields

export function addFieldIDs(record) {
  //const exclude = ['001', '005'];
  const exclude = [];

  if (!record) {
    return null;
  }
  return {
    leader: record.leader,
    fields: record.fields.map(f => {
      if (f.id || exclude.includes(f.tag)) {
        return f;
      }
      return {...f, id: uuid()};
    })
  };
}

//-----------------------------------------------------------------------------

export function insertField(record, field) {
  //const r = new MarcRecord(record);
  record.insertField({...field, id: uuid()});
}

//-----------------------------------------------------------------------------

export function removeExcluded(record, exclude, validationOptions) {
  if (!record?.fields) {
    return record;
  }

  return new MarcRecord(
    {
      ...record,
      fields: record.fields.filter(f => !exclude[f.id])
    },
    validationOptions
  );
}

//-----------------------------------------------------------------------------

export function applyEdits(record, replace, validationOptions = {}) { // eslint-disable-line
  if (!record?.fields) {
    return record;
  }

  return new MarcRecord(
    {
      ...record,
      fields: record.fields.map(f => replace[f.id] ? replace[f.id] : f)
    },
    validationOptions
  );
}
