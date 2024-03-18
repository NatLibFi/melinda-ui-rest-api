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

/* Koko kenttä, esim.:

$a 397 s. : $b kuv. , kartt., nuott. ; $c 25 cm

→ $a 1 verkkoaineisto (397 sivua) : $b kuvitettu, karttoja, nuotteja
*/

export function generate300(opts) { // eslint-disable-line no-unused-vars
  return (baseRecord, sourceRecord) => { // eslint-disable-line no-unused-vars
    const base = new MarcRecord(baseRecord, validationOff);
    const source = new MarcRecord(sourceRecord, validationOff);

    const [f300] = source.get('300');

    if (!f300) {
      return base;
    }

    //logger.debug(`F300: ${JSON.stringify(f300, null, 2)}`);

    const f300b = Subfield.getByCode(f300.subfields, /b/u);
    const f300rest = Subfield.getByCode(f300.subfields, /[^abc]/u);
    const f300new = {
      ...f300,
      subfields: [
        {code: 'a', value: ''},
        ...f300b,
        {code: 'c', value: ''},
        ...f300rest
      ]
    };

    //logger.debug(`New F300: ${JSON.stringify(f300new, null, 2)}`);

    base.insertField(f300new);

    return base;
  };
}
