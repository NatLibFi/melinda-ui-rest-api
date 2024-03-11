//*****************************************************************************
//
// Merging fields 400 - 499
//
//*****************************************************************************

/* eslint-disable no-unused-vars, array-bracket-newline */

import {Reducers} from '@natlibfi/marc-record-merge';

const fieldsDefault = [
  //490 ei oteta
].join('|');

const fieldsE2P = [
  //-------------------------------------------------------------------------
  // Sarjamerkintökentät 4xx:
  //"490": {"action": "createFrom", "options": {"subfields": {"a": {}, "x": {"modifications": [{"type": "replace", "args": [/[0-9-]+/u, ""]}]}, "v": {}}}},
  // "490": { "action": "copy", "options": { "dropOriginal": true, "reduce": { "subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/ } } },
  '490'
].join('|');

export function merge4XX(opts) {
  if (opts.type === 'e2p') {
    return [Reducers.copy({tagPattern: fieldsE2P})];
  }
  //return [Reducers.copy({tagPattern: defaultFields})];
  return [];
}
