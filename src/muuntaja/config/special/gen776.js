//*****************************************************************************
//
// Update base fields from source
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';

import {Subfield} from '../../../marcUtils/marcSubfields';
import {fillIfMissing} from '../print-to-e/defaults';
import {validationOff} from '../common';

import {createLogger} from '@natlibfi/melinda-backend-commons';
const logger = createLogger();

//-----------------------------------------------------------------------------
// F776: Update ISBN & formats from source 020 fields
//-----------------------------------------------------------------------------

export function generate776(opts) { // eslint-disable-line no-unused-vars
  return (baseRecord, sourceRecord) => { // eslint-disable-line no-unused-vars
    const base = new MarcRecord(baseRecord, validationOff);
    const source = new MarcRecord(sourceRecord, validationOff);

    const source020s = Subfield.from(source, '020');
    const sourceISBNs = Subfield.getByCode(source020s, 'a').map(s => s.value);

    if (!sourceISBNs.length) {
      return base;
    }

    const formatTag = opts.type === 'p2e' ? 'Painettu:' : 'Verkkoaineisto:';
    const fenniTag = opts.profile === 'FENNI' ? [{code: '9', value: 'FENNI<KEEP>'}] : [];

    /*
    base.insertField({
      tag: '776',
      ind1: '0',
      ind2: '8',
      subfields: [
        {code: 'i', value: 'Painettu:'},
        ...sourceISBNs.map(isbn => ({code: 'z', value: isbn})),
        {code: '9', value: 'FENNI<KEEP>'}
      ]
    });
    */
    base.insertFields(sourceISBNs.map(isbn => ({
      tag: '776',
      ind1: '0',
      ind2: '8',
      subfields: [
        {code: 'i', value: formatTag},
        {code: 'z', value: isbn},
        ...fenniTag
      ]
    })));

    return base;
  };
}
