//*****************************************************************************
//
// Default config for p-to-e transformations
//
//*****************************************************************************

import {MarcRecord} from '@natlibfi/marc-record';
import {Reducers} from '@natlibfi/marc-record-merge';
import {MelindaReducers, MelindaCopyReducerConfigs, MelindaMuuntajaFennicaReducers} from '@natlibfi/melinda-marc-record-merge-reducers'; // eslint-disable-line no-unused-vars

export default {
  'name': 'Oletus',
  'description': 'Muunnos täydentää e-aineiston tietueen painetun aineiston tietueen tiedoilla. Luokitus- ja sisällönkuvailukentistä kopioidaan vain omalle organisaatiolle merkityt kentät. Muunnos ei käsittele osakohteita.',
  'mergeType': 'printToE',
  base: baseRecord(),
  reducers: getReducers(),
  baseValidators: {
    subfieldValues: false
  },
  sourceValidators: {
    subfieldValues: false
  }
};

//-----------------------------------------------------------------------------

function getReducers() {
  return [
    ...MelindaCopyReducerConfigs.map(conf => Reducers.copy(conf)),
    ...MelindaReducers
  ];
}

//-----------------------------------------------------------------------------

function baseRecord() {
  return new MarcRecord({
    leader: '00000cam^a22006134i^4500',
    fields: [
      {
        tag: '001',
        value: '000000000'
      },
      {
        tag: '007',
        value: 'cr^||^||||||||'
      },
      {
        tag: '008',
        value: '^^^^^^s2018^^^^fi^||||^o^^^^^|0|^0|fin|^'
      },
      {
        tag: '041',
        ind1: '0',
        ind2: ' ',
        subfields: [
          {
            code: 'a',
            value: 'eng'
          }
        ]
      },
      {
        tag: '337',
        ind1: ' ',
        ind2: ' ',
        subfields: [
          {
            code: 'a',
            value: 'tietokonekäyttöinen'
          },
          {
            code: 'b',
            value: 'c'
          },
          {
            code: '2',
            value: 'rdamedia'
          }
        ]
      },
      {
        tag: '338',
        ind1: ' ',
        ind2: ' ',
        subfields: [
          {
            code: 'a',
            value: 'verkkoaineisto'
          },
          {
            code: 'b',
            value: 'cr'
          },
          {
            code: '2',
            value: 'rdacarrier'
          }
        ]
      }
    ]
  });
}
