//*****************************************************************************
//
// Update control fields
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';
import {Reducers} from '@natlibfi/marc-record-merge';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {replaceField} from '../../marc-record-utils';

export const controlReducers = [
  // Copy language tags before processing
  Reducers.copy({tagPattern: new RegExp(/^041$/u, 'u')}),

  // Control fields
  f001,
  Reducers.copy({tagPattern: /^002$/u, compareTagsOnly: true}),
  Reducers.copy({tagPattern: /^003$/u, compareTagsOnly: true}),
  Reducers.copy({tagPattern: /^004$/u, compareTagsOnly: true}),
  Reducers.copy({tagPattern: /^005$/u, compareTagsOnly: true}),
  Reducers.copy({tagPattern: /^006$/u, compareTagsOnly: true}),
  Reducers.copy({tagPattern: /^007$/u, compareTagsOnly: true}),
  f008,
  Reducers.copy({tagPattern: /^009$/u, compareTagsOnly: true})
];

const logger = createLogger();

//-----------------------------------------------------------------------------

function f001(base, source) {
  const emptyID = {tag: '001', value: '000000000'};
  const [id] = base.getFields('001');

  if (!id) {
    base.insertField(emptyID);
    return base;
  }
  return base;
}

//-----------------------------------------------------------------------------

function f008(base, source) {
  const base008 = split008(base);
  const source008 = split008(source);

  //logger.debug(`Base 008: ${JSON.stringify(base008)}`);
  //logger.debug(`Source 008: ${JSON.stringify(source008)}`);


  return base;

  function split008(record) {
    const [field] = record.getFields('008');
    if (!field) {
      return null;
    }
    const {value} = field;
    return {
      created: value.slice(0, 6),
      published: {
        type: value.slice(6, 7),
        year1: value.slice(7, 11),
        year2: value.slice(11, 15),
        country: value.slice(15, 18),
        empty: value.slice(18, 35),
        language: value.slice(35, 38),
        transformed: value.slice(38, 39),
        organisation: value.slice(39, 40)
      }
    };
  }

  function tag041(lang) {
    return {
      tag: '041',
      ind1: '0',
      ind2: ' ',
      subfields: [
        {
          code: 'a',
          value: lang
        }
      ],
      uuid: 'ac44d08d-5532-49bc-b2b9-c863cf930b1a'
    };
  }
}
