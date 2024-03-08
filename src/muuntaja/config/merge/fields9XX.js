//*****************************************************************************
//
// Merging fields 900 - 999
//
//*****************************************************************************

/* eslint-disable no-unused-vars, array-bracket-newline */

import {Reducers} from '@natlibfi/marc-record-merge';
import {getDefaultValue} from '../print-to-e/defaults';
import {MarcRecord} from '@natlibfi/marc-record';
import {validationOff} from '../common';

//9XX ei oteta

//-------------------------------------------------------------------------
// Suomalaiset kentät 9xx:
//"900": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP)>/u}}},
//"910": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP)>/u}}}

const fieldsE2P = [
  '900',
  '910'
].join('|');

export function merge9XX(opts) {

  function fillDefault(tag) {
    return (baseRecord, source) => {
      const base = new MarcRecord(baseRecord, validationOff);
      const field = getDefaultValue(tag, opts);
      base.insertField(field);
      return base;
    };
  }

  function fieldsFenni() {
    if (opts.profile === 'FENNI') {
      return [fillDefault('901/FENNI')];
    }
    return [];
  }

  if (opts.type === 'e2p') {
    return [
      Reducers.copy({tagPattern: fieldsE2P}),
      ...fieldsFenni()
    ];
  }
  return [...fieldsFenni()];
}
