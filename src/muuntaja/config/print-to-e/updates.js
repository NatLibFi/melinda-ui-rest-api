//*****************************************************************************
//
// Update base fields from source
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';

import {f008Split, f008Get, f008toString} from '../../marc-utils/marc-utils';
import {Subfield} from '../../marc-utils/marc-subfields';
import {getDefaultValue, getFieldOrDefault} from './defaults';

import {createLogger} from '@natlibfi/melinda-backend-commons';
const logger = createLogger();

//-----------------------------------------------------------------------------
// F008: Update language info
//-----------------------------------------------------------------------------

export function update008(opts) { // eslint-disable-line no-unused-vars
  return (base, source) => {
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
// F020: Update ISBN & formats from source 776
//-----------------------------------------------------------------------------

export function update020(opts) { // eslint-disable-line no-unused-vars
  return (base, source) => { // eslint-disable-line no-unused-vars
    // Get ISBNs from source 776 fields

    const source776 = source.get('776').map(f => f.subfields).flat();
    const sourceISBNs = Subfield.getByCode(source776, 'z').map(s => s.value);

    if (!sourceISBNs.length) {
      return base;
    }

    //logger.debug(`Source ISBNs: ${JSON.stringify(sourceISBNs, null, 2)}`);

    // Get ISBNs from base F020
    const base020 = base.get('020');
    //logger.debug(`Base020: ${JSON.stringify(base020, null, 2)}`);
    base020.forEach(f => base.removeField(f));

    const baseSubfields = base020
      .map(f => f.subfields)
      .flat();

    const baseISBNs = baseSubfields
      .filter(s => s.code === 'a')
      .map(s => s.value);

    //logger.debug(`Base ISBNs: ${JSON.stringify(baseISBNs, null, 2)}`);

    // New ISBNs
    const newSubfields = [...sourceISBNs.filter(s => !baseISBNs.includes(s))].map(s => ({code: 'a', value: s}));

    //logger.debug(`New ISBNs: ${JSON.stringify(newISBNs, null, 2)}`);

    const field = {
      tag: '020', ind1: ' ', ind2: ' ',
      subfields: [
        ...newSubfields,
        ...baseSubfields
      ],
      uuid: '09d0afca-a46b-4ca8-a869-a1b036a657d1'
    };
    //logger.debug(`New 020: ${JSON.stringify(field, null, 2)}`);
    base.insertField(field);
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

//-----------------------------------------------------------------------------
// FLOW: Add current LOW if missing
//-----------------------------------------------------------------------------

export function updateLOW(opts) { // eslint-disable-line no-unused-vars
  return (base, source) => {
    const {LOWTAG} = opts;

    //logger.debug(`Base: ${JSON.stringify(base, null, 2)}`);
    //logger.debug(`opts: ${JSON.stringify(opts, null, 2)}`);
    //logger.debug(`LOWTAG: ${JSON.stringify(LOWTAG, null, 2)}`);

    if (!LOWTAG) {
      return base;
    }

    const [hasLOW] = base.get('LOW')
      .map(f => f.subfields)
      .flat()
      .filter(s => s.code === 'a')
      .filter(s => s.value === LOWTAG);
    //logger.debug(`LOW: ${JSON.stringify(LOWs, null, 2)}`);
    if (!hasLOW) {
      base.insertField({
        tag: 'LOW', ind1: ' ', ind2: ' ',
        subfields: [{code: 'a', value: LOWTAG}],
        uuid: '2b41748e-8347-4ae7-ab9b-f422af92ce38'
      });
      return base;
    }
    return base;
  };
}

//const fields1 = [LOWTAG ?  : null].filter(f => f).map(f => missing(f));

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
