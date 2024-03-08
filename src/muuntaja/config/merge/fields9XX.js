//*****************************************************************************
//
// Merging fields 900 - 999
//
//*****************************************************************************

/* eslint-disable no-unused-vars, array-bracket-newline */

import {Reducers} from '@natlibfi/marc-record-merge';

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

  if (opts.type === 'e2p') {
    return [
      Reducers.copy({tagPattern: fieldsE2P})
    ];
  }
  return [];
}
