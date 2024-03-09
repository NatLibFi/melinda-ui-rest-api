//*****************************************************************************
//
// Update base fields from source
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';

import {f008Split, f008Get, f008toString} from '../../../marcUtils/marcUtils';
import {Subfield} from '../../../marcUtils/marcSubfields';
import {fillIfMissing, getDefaultValue, getFieldOrDefault} from '../baserecord/print2e';
import {validationOff} from '../common';

import {createLogger} from '@natlibfi/melinda-backend-commons';
const logger = createLogger();

//-----------------------------------------------------------------------------
// FLOW: Add current LOW if missing
//-----------------------------------------------------------------------------

export function generateLOW(opts) { // eslint-disable-line no-unused-vars
  return (baseRecord, sourceRecord) => {
    const base = new MarcRecord(baseRecord, validationOff);
    //const source = new MarcRecord(sourceRecord, validationOff);

    const {LOWTAG} = opts;

    //logger.debug(`Base: ${JSON.stringify(base, null, 2)}`);
    //logger.debug(`opts: ${JSON.stringify(opts, null, 2)}`);
    //logger.debug(`LOWTAG: ${JSON.stringify(LOWTAG, null, 2)}`);

    if (!LOWTAG) {
      return base;
    }

    const [hasLOW] = Subfield.from(base, 'LOW')
      .filter(s => s.code === 'a')
      .filter(s => s.value === LOWTAG);
    //logger.debug(`LOW: ${JSON.stringify(LOWs, null, 2)}`);
    if (!hasLOW) {
      const LOW = getDefaultValue('LOW', opts);
      base.insertField(LOW);
      return base;
    }
    return base;
  };
}

//const fields1 = [LOWTAG ?  : null].filter(f => f).map(f => missing(f));
