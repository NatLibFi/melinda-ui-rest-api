//*****************************************************************************
//
// Update base fields from source
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';

import {f008Split, f008Get, f008toString} from '../../../marcUtils/marcUtils';
import {Subfield} from '../../../marcUtils/marcSubfields';
import {fillIfMissing, getDefaultValue, getFieldOrDefault} from '../print-to-e/defaults';
import {validationOff} from '../common';

import {createLogger} from '@natlibfi/melinda-backend-commons';
const logger = createLogger();

//-----------------------------------------------------------------------------
// F020: Update ISBN & formats from source 776 fields
//-----------------------------------------------------------------------------

function f776to020(base, source776, opts) {
  const sourceSubfields = Subfield.fromFields(source776);
  const sourceISBNs = Subfield.getByCode(sourceSubfields, 'z').map(s => s.value);

  if (!sourceISBNs.length) {
    return;
  }

  const baseSubfields = Subfield.from(base, '020');
  const baseISBNs = Subfield.getByCode(baseSubfields, 'a').map(s => s.value);

  //logger.debug(`Base020: ${JSON.stringify(base020, null, 2)}`);
  //logger.debug(`Base ISBNs: ${JSON.stringify(baseISBNs, null, 2)}`);

  // New ISBNs
  const newISBNs = [...sourceISBNs.filter(s => !baseISBNs.includes(s))];

  if (!newISBNs.length) {
    return;
  }

  //logger.debug(`New ISBNs: ${JSON.stringify(newISBNs, null, 2)}`);

  return newISBNs.map(s => ({
    tag: '020', ind1: ' ', ind2: ' ',
    subfields: [{'code': 'a', 'value': s}]
    //id: source776.id
  }));
}

function fillMissing020(base, opts) {
  fillIfMissing(base, '020');
  return base;
}

export function generate020(opts) { // eslint-disable-line no-unused-vars
  return (baseRecord, sourceRecord) => { // eslint-disable-line no-unused-vars
    const base = new MarcRecord(baseRecord, validationOff);
    const source = new MarcRecord(sourceRecord, validationOff);

    // Get ISBNs (subcode z values) from source 776 fields
    const source776s = source.get('776');

    const f020 = source776s.map(f776 => f776to020(base, f776, opts)).flat();
    base.insertFields(f020);
    fillMissing020(base);
    return base;
  };
}
