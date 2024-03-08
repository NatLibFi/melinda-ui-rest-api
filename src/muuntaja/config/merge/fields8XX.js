//*****************************************************************************
//
// Merging fields 800 - 899
//
//*****************************************************************************

/* eslint-disable no-unused-vars, array-bracket-newline */

import {Reducers} from '@natlibfi/marc-record-merge';
import {getDefaultValue} from '../print-to-e/defaults';
import {MarcRecord} from '@natlibfi/marc-record';
import {validationOff} from '../common';

//-------------------------------------------------------------------------
// Sarjalisäkirjauskentät 80x - 830:
//"810": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
//"811": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
//"830": {"action": "createFrom", "options": {"subfields": {"a": {}, "x": {"modifications": [{"type": "replace", "args": [/[0-9-]+/u, ""]}]}, "v": {}}}},

//80X-830 ei oteta
//841-878 ei oteta
//880 $6-osakentässä linkitetyn kentän mukaan
//881-887 ei oteta (joku 883 $a muuntaja varmaan luodaan?)

const fieldsE2P = [
  '810',
  '811'
  //copy('830'),
].join('|');


export function merge8XX(opts) {

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
      return [fillDefault('856/FENNI')];
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
