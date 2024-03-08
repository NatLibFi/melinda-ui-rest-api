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

//-----------------------------------------------------------------------------
// F41: Update language info
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// F300: Update side numbers
//-----------------------------------------------------------------------------

export function update300(opts) { // eslint-disable-line no-unused-vars
  /* Koko kenttä, esim.:

  $a 397 s. : $b kuv. , kartt., nuott. ; $c 25 cm

  → $a 1 verkkoaineisto (397 sivua) : $b kuvitettu, karttoja, nuotteja
  */

}

//-----------------------------------------------------------------------------
// F530: Added, if source has no 020. Generally, same info on 776 fields
//-----------------------------------------------------------------------------

export function update530(opts) { // eslint-disable-line no-unused-vars
  /*
  Ei käytetä, poistettava oletuspohjasta.

  Mukaan, jos lähdetietueesta puuttuu 020 $a

  530-kentän antama informaatio on jo useimmiten 776-kentässä.
  */
}

//-----------------------------------------------------------------------------
// F776: Update link to source
//-----------------------------------------------------------------------------

export function update776(opts) { // eslint-disable-line no-unused-vars
  /*
  Kaikki lähdetietueen 020-kentät täytyy saada siirretyksi tulostietueeseen erillisiksi 776-kentiksi.

  Jokaisesta lähdetietueen 020-kentästä uusi 776-kenttä.
  */

  /*
  return (base, source) => {
    const [source020] = source.get('020');
  };
  */
}

//*****************************************************************************
//*****************************************************************************
//*****************************************************************************
//*****************************************************************************

export function update041(base, source) {
  //const baseFields = base.get(/^041$/u);
  const [sourceF041] = source.get(/^041$/u);
  //const nonIdenticalFields = getNonIdenticalFields(baseFields, sourceFields);

  if (sourceF041) {
    base.insertField(sourceF041);
    return base;
  }

  //if(sourceFields) return sourceFields[0];
  //return baseFields[0];

  return base;

  /*
  if (nonIdenticalFields.length === 0) {
    debug('Identical fields in source and base');
    return base;
  }

  return copyFields(base, nonIdenticalFields);
  */
}


/*
export function copyFields(record, fields) {
  fields.forEach(f => {
    debug(`Field ${fieldToString(f)} copied from source to base`);
    record.insertField(f);
  });
  // const tags = fields.map(field => field.tag);
  // tags.forEach(tag => debug('Field '+ mapDataField(copied from source to base`));
  return record;
}
*/
