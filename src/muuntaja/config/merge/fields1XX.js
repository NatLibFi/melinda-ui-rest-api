//*****************************************************************************
//
// Merging fields 000 - 099
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {Reducers} from '@natlibfi/marc-record-merge';

const fieldsToMerge = [
  //1XX mergetään (prioriteetti tällä)
  '1\\d\\d'
].join('|');

export function merge1XX(opts) {
  return [Reducers.copy({tagPattern: fieldsToMerge})];
}
