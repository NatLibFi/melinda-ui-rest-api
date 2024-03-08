//*****************************************************************************
//
// Fennica profile fields
//
//*****************************************************************************

/* eslint-disable no-unused-vars, array-bracket-newline */

import {Reducers} from '@natlibfi/marc-record-merge';
import {getDefaultValue} from '../print-to-e/defaults';
import {MarcRecord} from '@natlibfi/marc-record';
import {validationOff} from '../common';

export function getFenniFields(opts) {

  if (opts.profile !== 'FENNI') {
    return [];
  }

  function fillDefault(tag) {
    return (baseRecord, source) => {
      const base = new MarcRecord(baseRecord, validationOff);
      const field = getDefaultValue(tag, opts);
      base.insertField(field);
      return base;
    };
  }

  return [
    fillDefault('856/FENNI'),
    fillDefault('901/FENNI')
  ];
}
