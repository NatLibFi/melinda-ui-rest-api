//*****************************************************************************
//
// Simple utils for MARC records
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';
import {v4 as uuid} from 'uuid';

//-----------------------------------------------------------------------------

export function fieldHasSubfield(code, value) {
  const querySubfield = {code, value};

  return function (field) {
    return field.subfields.some(subfield => subfield === querySubfield);
  };
}

export function selectFirstValue(field, subcode) {
  if (field.subfields) {
    return field.subfields
      .filter(subfield => subcode.equals ? subcode.equals(subfield.code) : subcode === subfield.code)
      .map(subfield => subfield.value)
      .slice(1);
  }
  return field.value;
}

export function replaceField(record, field) {
  const {tag} = field;
  record.removeField(tag);
  record.insertField(field);
  return record;

  /*
  return new MarcRecord({
    leader: record.leader,
    fields: [
      ...record.fields.filter(f => f.tag !== tag),
      field
    ]
  });
  */
}

export function decorate(record, tag) { // eslint-disable-line
  if (!record) {
    return null;
  }
  return {
    leader: record.leader,
    fields: record.fields.map(f => ({...f, ...tag}))
  };
}

function removeProperty(propKey, {[propKey]: propValue, ...rest}) { // eslint-disable-line
  return rest;
}

// Add missing UUIDs for tracing fields
export function addUUID(record) { // eslint-disable-line
  if (!record) {
    return null;
  }
  return {
    leader: record.leader,
    fields: record.fields.map(f => {
      if (f.uuid || ['001', '005'].includes(f.tag)) {
        return f;
      }
      return {...f, uuid: uuid()};
    })
  };
}

//-----------------------------------------------------------------------------

export function f008Get(record) {
  const [field] = record.getFields('008');
  if (!field) {
    return null;
  }
  return field;
}

export function f008Split(field) {
  if (!field) {
    return null;
  }

  const {value} = field;
  return {
    created: value.slice(0, 6),
    pubtype: value.slice(6, 7),
    year1: value.slice(7, 11),
    year2: value.slice(11, 15),
    country: value.slice(15, 18),
    empty: value.slice(18, 35),
    language: value.slice(35, 38),
    transformed: value.slice(38, 39),
    organisation: value.slice(39, 40)
  };
}

export function f008toString(f008) {
  const value = {
    created: '      ',
    ...f008
  };
}
