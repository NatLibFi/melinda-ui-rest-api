//*****************************************************************************
//
// Merging fields 200 - 299
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {Reducers} from '@natlibfi/marc-record-merge';

const fieldsToMerge = [
  '2[0|1|2|3|4]\\d', // 20X-24X otetaan (ainakin 245$k pitä tiputtaa pois)
  '264' // MUU-595
  //250-270 ei oteta
].join('|');

export function merge2XX(opts) {
  return [Reducers.copy({tagPattern: fieldsToMerge})];
}
