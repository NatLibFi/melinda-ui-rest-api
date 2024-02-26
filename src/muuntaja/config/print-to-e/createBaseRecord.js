//*****************************************************************************
//
// Create print-to-e base record from source and options
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';
import merger, {Reducers} from '@natlibfi/marc-record-merge';
import {createLogger} from '@natlibfi/melinda-backend-commons';

import {getDefaultValue} from './defaults';

import {f008Split, f008Get} from '../../../marcUtils/marcUtils';
import {updateLOW} from './updates';
import {validationOff} from '../common';

const logger = createLogger();

//-----------------------------------------------------------------------------
// Create base record from source and options

export function createBase(options) {

  const baseRecord = new MarcRecord(
    {
      leader: getDefaultValue('LDR').value,
      fields: []
    },
    validationOff
  );

  //*
  return merger({
    base: baseRecord,
    reducers: getReducers(options)
  }).sortFields();

  /*/
  const result = merger({
    base: baseRecord,
    source: sourceRecord,
    reducers: getReducers(opts)
  });
  return sortFields(result);

  /**/
}

//-----------------------------------------------------------------------------
// Create base record

function getReducers(options) {

  const fenniFields = [];
  //fillDefault('506/FENNI'),
  //fillDefault('530/FENNI') // MUU-356
  //fillDefault('540/FENNI'),
  //fillDefault('856/FENNI'),
  //fillDefault('901/FENNI')

  return [
    // Placeholders (for testing purposes)
    //fillDefault('LOW/KVP'),
    //fillDefault('LOW/ALMA'),
    //fillDefault('LOW/FENNI')

    //fillDefault('001'),
    //fillDefault('003'),
    //fillDefault('005')

    // Fenni fields (for testing purposes)
    ...options.LOWTAG === 'FENNI' ? fenniFields : [],

    // Default fields
    fillDefault('007'),
    fillDefault('008'),
    fillDefault('020'),
    fillDefault('040'),
    //fillDefault('041'), // MUU-502
    //fillDefault('042'),
    fillDefault('300'),
    fillDefault('337'),
    fillDefault('338'),
    fillDefault('506/1'),
    fillDefault('506/2')
    //fillDefault('530') // 530 is added, if there is no generated 776
    //updateLOW(options)

    //Reducers.copy({tagPattern: new RegExp(/^041$/u, 'u')}),
  ];

  function fillDefault(tag) {
    return (base) => {
      const field = getDefaultValue(tag, options);
      base.insertField(field);
      return base;
    };
  }
}

//-----------------------------------------------------------------------------
// Extract info from source

function getSourceInfo(source) {
  const f008 = getF008(source);

  //logger.debug(`Language: ${f008.language}`);

  return {
    language: f008.language
  };

  function getF008(record) {
    const f008 = f008Split(f008Get(record));
    return f008 || {};
  }
}
