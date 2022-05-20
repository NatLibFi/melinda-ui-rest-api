//

import {MarcRecord} from '@natlibfi/marc-record';

const baseRecord = new MarcRecord({
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

export default {
  'name': 'Oletus',
  'description': 'Muunnos täydentää e-aineiston tietueen painetun aineiston tietueen tiedoilla. Luokitus- ja sisällönkuvailukentistä kopioidaan vain omalle organisaatiolle merkityt kentät. Muunnos ei käsittele osakohteita.',
  'mergeType': 'printToE',
  'record': {
    'targetRecord': baseRecord,
    'validationRules': {},
    'postMergeFixes': {},
    'mergeConfiguration': {}
  }
};
