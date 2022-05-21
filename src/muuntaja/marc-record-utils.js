//*****************************************************************************
//
// Simple utils for MARC records
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';
import {v4 as uuid} from 'uuid';

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
      if (f.uuid !== '') {
        return {...f, uuid: uuid()};
      }
      return f;
    })
  };
}
