//*****************************************************************************
//
// Merging fields 600 - 699
//
//*****************************************************************************

/* eslint-disable no-unused-vars, array-bracket-newline */

import {Reducers} from '@natlibfi/marc-record-merge';

//-------------------------------------------------------------------------
// Asiasanakentät 6xx:
//"6..": {"action": "copy", "options": {"copyIf": {"9": {"value": "FENNI<KEEP>"}}}},
//copy({tagPattern: new RegExp(/^6\d\d$/u, 'u')})
// FENNI = kopioidaan vain ne, joissa on FENNI<KEEP>

const fieldsDefault = [
  '6\\d\\d' // 6XX otetaan kaikki
].join('|');

const fieldsE2P = [
  // Exclude 653
  '6[0,1,2,3,4,6,7,8,9]\\d',
  '65[0,1,2,4,5,6,7,8,9]'
].join('|');

export function merge6XX(opts) {

  if (opts.type === 'e2p') {
    return [Reducers.copy({tagPattern: fieldsE2P})];
  }
  return [Reducers.copy({tagPattern: fieldsDefault})];
}
