//*****************************************************************************
//
// Update base fields from source
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';

import {Subfield} from '../../../marcUtils/marcSubfields';
import {fillIfMissing} from '../baserecord/print2e';
import {validationOff} from '../common';

import {createLogger} from '@natlibfi/melinda-backend-commons';
const logger = createLogger();

//-----------------------------------------------------------------------------
// F020: Update ISBN & formats from source 776 fields
//-----------------------------------------------------------------------------

function fillMissing020(base, opts) {
  fillIfMissing(base, '020');
  return base;
}

export function generate020(opts) { // eslint-disable-line no-unused-vars
  return (baseRecord, sourceRecord) => { // eslint-disable-line no-unused-vars
    const base = new MarcRecord(baseRecord, validationOff);
    const source = new MarcRecord(sourceRecord, validationOff);

    const source776s = Subfield.from(source, '776');
    const ISBNs = Subfield.getByCode(source776s, 'z').map(s => s.value);

    base.insertFields(ISBNs.map(s => ({
      tag: '020', ind1: ' ', ind2: ' ',
      subfields: [{code: 'a', value: s}, {code: 'q', value: ''}]
    })));

    fillMissing020(base);
    return base;
  };
}
