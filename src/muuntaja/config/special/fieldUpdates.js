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
// F008: Update language info
//-----------------------------------------------------------------------------

export function update008(opts) { // eslint-disable-line no-unused-vars
  return (baseRecord, sourceRecord) => {

    //logger.debug(`Base: ${JSON.stringify(baseRecord, null, 2)}`);
    //logger.debug(`Source: ${JSON.stringify(sourceRecord)}`);

    const base = new MarcRecord(baseRecord, validationOff);
    const source = new MarcRecord(sourceRecord, validationOff);

    const source008 = f008Get(source);

    if (!source008) {
      return base;
    }

    const base008 = f008Get(base);

    if (!base008) {
      base.insertField(source008);
      return base;
    }

    const fields = f008Split(base008);
    if (fields.language !== '   ') {
      return base;
    }

    const value = f008toString({
      ...fields,
      language: f008Split(source008).language
    });
    //logger.debug(`008: ${value}`);
    base.removeField(base008);
    base.insertField({...base008, value});
    return base;
  };
}
