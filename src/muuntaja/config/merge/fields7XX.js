//*****************************************************************************
//
// Merging fields 600 - 699
//
//*****************************************************************************

/* eslint-disable no-unused-vars, array-bracket-newline */

import {Reducers} from '@natlibfi/marc-record-merge';

//-------------------------------------------------------------------------
// Lisäkirjauskentät 70x - 75x:
//"700": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
//"710": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
//"711": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},

//-------------------------------------------------------------------------
// Linkkikentät 76x - 78x:
//"776": {"action": "createFrom", "options": {"convertTag": "020", "ind1": " ", "ind2": " ", "subfields": {"z": {"convertCode": "a", modifications: [hyphenate]}}}},
//copy('776'),

const fieldsDefault = [
  '7[0|1|2|3|4|5]\\d' //70X-75X mergetään (tätä priorisoiden)
  //76X-78X: ei oteta, ainakaan $w-osakenttiä ei voida ottaa, Huom! 776 generoidaan emon 020-kentistä (tai 022? tai...)
].join('|');

export function merge7XX(opts) {

  /*
  if (opts.type === 'e2p') {
    return [Reducers.copy({tagPattern: fieldsE2P})];
  }
  */
  return [Reducers.copy({tagPattern: fieldsDefault})];
}
