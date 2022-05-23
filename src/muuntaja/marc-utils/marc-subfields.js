//*****************************************************************************
//
// Marc subfield manipulations
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';

import {createLogger} from '@natlibfi/melinda-backend-commons';
import {fromAlephId} from '@natlibfi/melinda-commons/dist/utils';
const logger = createLogger();

//-----------------------------------------------------------------------------

export const Subfield = {

  getByCode(subfields, code) {
    return subfields.filter(s => s.code === code);
  },
  getByValue(subfields, value) {
    return subfields.filter(s => s.value === value);
  },
  dropByCode(subfields, code) {
    return subfields.filter(s => s.code !== code);
  },
  dropByValue(subfields, value) {
    return subfields.filter(s => s.value !== value);
  },

  fromFields(...fields) {
    return fields.flat().map(f => f.subfields).flat();
  },

  from(record, ...tag) {
    const fields = tag.map(tag => record.get(tag)).flat();
    return Subfield.fromFields(fields);
  },

  concat(...subfields) {
    return [...subfields.flat(2)];
  }
};

//-----------------------------------------------------------------------------
// For record sort

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
