//*****************************************************************************
//
// Create print-to-e base record from source and options
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';
import merger, {Reducers} from '@natlibfi/marc-record-merge';
import {createLogger} from '@natlibfi/melinda-backend-commons';

import {f008Split, f008Get} from '../../marc-record-utils';

const logger = createLogger();

//-----------------------------------------------------------------------------
// Create base record from source and options

export function createBase(source, options) {

  const opts = {
    ...options,
    ...sourceInfo(new MarcRecord(source))
  };

  return merger({
    baseValidators: {
      subfieldValues: false
    },
    sourceValidators: {
      subfieldValues: false
    },
    reducers: getReducers(opts),
    base: defaultFields(),
    source
  });
}

//-----------------------------------------------------------------------------
// Extract info from source

function sourceInfo(source) {
  const f008 = getF008(source);

  logger.debug(`Language: ${f008.language}`);

  return {
    language: f008.language
  };

  function getF008(record) {
    const f008 = f008Split(f008Get(record));
    return f008 || {};
  }
}

//-----------------------------------------------------------------------------

function getReducers(options) {
  return [
    //Reducers.copy({tagPattern: new RegExp(/^041$/u, 'u')}),
    addLanguage(options),
    addFormat(options)
  ];
}

//-----------------------------------------------------------------------------

function addLanguage(opts) {
  return (base, source) => {
    if (opts.language && !source.getFields(/^041/u)) {
      base.insertField({
        tag: '041', ind1: '0', ind2: ' ',
        subfields: [{code: 'a', value: opts.language}],
        uuid: 'ac44d08d-5532-49bc-b2b9-c863cf930b1a'
      });
      return base;
    }
    return base;
  };
}

function addFormat(opts) {
  return (base, source) => {
    if (opts.format) {
      base.insertField({
        tag: '020', ind1: ' ', ind2: ' ',
        subfields: [
          {code: 'a', value: ''},
          {code: 'q', value: opts.format}
        ],
        uuid: '1ed797e0-1026-425b-9ef4-fc4d3771914a'
      });
      return base;
    }
    return base;
  };
}

//-----------------------------------------------------------------------------

function defaultFields() {
  return {
    leader: '00000cam^a22006134i^4500',
    fields: [
      {tag: '001', value: '-'},
      {tag: '005', value: '-'},
      {
        tag: '337', ind1: ' ', ind2: ' ',
        subfields: [
          {code: 'a', value: 'tietokonekäyttöinen'},
          {code: 'b', value: 'c'},
          {code: '2', value: 'rdamedia'}
        ],
        uuid: '66029c77-30a4-42a2-bf23-6499ca97fe87'
      },
      {
        tag: '338', ind1: ' ', ind2: ' ',
        subfields: [
          {code: 'a', value: 'verkkoaineisto'},
          {code: 'b', value: 'cr'},
          {code: '2', value: 'rdacarrier'}
        ],
        uuid: '55e6067b-8eba-44c1-a53c-293641a40729'
      }
    ]
  };
}

/*
const br = {
  leader: '00000cam^a22006134i^4500',
  fields: [
    {
      tag: '007',
      value: 'cr^||^||||||||',
      uuid: '7e290cd1-6bed-4447-8fc3-c1f7e41b760a'
    },
    {
      tag: '008',
      value: '^^^^^^s2018^^^^fi^||||^o^^^^^|0|^0|fin|^',
      uuid: '4bc968f1-9186-4d04-ba09-7537d0c4ee95'
    }
  ]
};
*/
