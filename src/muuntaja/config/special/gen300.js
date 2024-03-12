//*****************************************************************************
//
// From source 300, take everything but subfield a - insert it as empty.
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';

import {Subfield} from '../../../marcUtils/marcSubfields';
import {fillIfMissing} from '../baserecord/print2e';
import {validationOff} from '../common';

import {createLogger} from '@natlibfi/melinda-backend-commons';
const logger = createLogger();

export function generate300(opts) { // eslint-disable-line no-unused-vars
  return (baseRecord, sourceRecord) => { // eslint-disable-line no-unused-vars
    const base = new MarcRecord(baseRecord, validationOff);
    const source = new MarcRecord(sourceRecord, validationOff);

    const f300s = source.get('300');

    if (!f300s.length) {
      return base;
    }

    const [f300] = f300s;

    //logger.debug(`F300: ${JSON.stringify(f300, null, 2)}`);

    const f300subfields = Subfield.dropByCode(f300.subfields, 'a');

    base.insertField({
      ...f300,
      subfields: [
        {code: 'a', value: ''},
        ...f300subfields
      ]
    });

    return base;
  };
}
