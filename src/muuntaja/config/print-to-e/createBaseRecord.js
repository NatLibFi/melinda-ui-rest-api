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

import {f008Split, f008Get} from '../../marc-utils/marc-utils';
import {sortFields} from '../../marc-utils/marc-field-sort';
import {update020} from './updates';

const logger = createLogger();

//-----------------------------------------------------------------------------
// Create base record from source and options

export function createBase(source, options) {

  const opts = {
    ...options,
    ...getSourceInfo(new MarcRecord(source))
  };

  return sortFields(merger({
    baseValidators: {
      fields: false,
      subfields: false,
      subfieldValues: false
    },
    sourceValidators: {
      subfieldValues: false
    },
    reducers: getReducers(opts),
    base: {
      leader: getDefaultValue('LDR').value,
      fields: []
    },
    source
  }));
}

//-----------------------------------------------------------------------------
// Create base record

function getReducers(options) {
  const placeholders = [
    fillDefault('001'),
    fillDefault('005')
  ];

  return [
    ...placeholders,
    fillDefault('003'),
    fillDefault('007'),
    fillDefault('008'),
    fillDefault('020'),
    fillDefault('040'),
    fillDefault('041'),
    fillDefault('042'),
    fillDefault('300'),
    fillDefault('337'),
    fillDefault('338'),
    fillDefault('506/1'),
    fillDefault('506/2')
    //fillDefault('530') // 530 is added, if there is no generated 776

    //Reducers.copy({tagPattern: new RegExp(/^041$/u, 'u')}),
    //addLanguage(options),
    //addFormat(options)
  ];

  function fillDefault(tag) {
    return (base, source) => {
      const field = getDefaultValue(tag);
      //logger.debug(`Inserting: ${JSON.stringify(field)}`);
      //base.insertField(field);
      return {
        leader: base.leader,
        fields: [
          ...base.fields,
          field
        ].filter(f => f)
      };
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
