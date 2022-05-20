//*****************************************************************************
//
// Default config for p-to-e transformations
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';
import {Reducers} from '@natlibfi/marc-record-merge';
import copy from '@natlibfi/marc-record-merge/dist/reducers/copy';
import {MelindaReducers, MelindaCopyReducerConfigs} from '@natlibfi/melinda-marc-record-merge-reducers';
//import {MelindaMuuntajaFennicaReducers} from '@natlibfi/melinda-marc-record-muuntaja-reducers'

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
  },
  preferSource: true
};

//-----------------------------------------------------------------------------

function getReducers() {
  return [...localReducers()];
}

//...MelindaMuuntajaFennicaReducers.map(conf => Reducers.copy(conf)),
//...MelindaCopyReducerConfigs.map(conf => Reducers.copy(conf)),
//...MelindaReducers

//-----------------------------------------------------------------------------

function localReducers() {

  return [
    //...copyReducers().map(conf => Reducers.copy(conf)),

    //"020": {"action": "createFrom", "options": {"convertTag": "776", "ind1": "0", "ind2": "8", "subfields": {"i": {"replaceValue": "Painettu:"}, "a": {convertCode: "z", modifications: [{type: "replace", args: [/-/gu, ""]}]}}}},
    //"041": {"action": "copy", "options": {"dropOriginal": true, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    copy({tagPattern: new RegExp(/^041$/u, 'u'), compareTagsOnly: true}),

    //"080": {"action": "copy", "options": {"copyIf": {"9": {"value": "FENNI<KEEP>"}}}},
    //"084": {"action": "copy", "options": {"copyIf": {"9": {"value": "[LOWTAG]<KEEP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},

    //"1..": {"action": "copy", "options": {"dropOriginal": true}},
    copy({tagPattern: new RegExp(/^1\d\d$/u, 'u')}),

    //"240": {"action": "copy", "options": {"dropOriginal": true, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"245": {"action": "copy", "options": {"dropOriginal": true, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"246": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"250": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP>)>/u}}},
    //"260": {"action": "createFrom", "options": {"convertTag": "264", "ind1": ' ', "ind2": "1", "subfields": {"a": {}, "b": {}, "c": {}, "3": {}, "6": {}, "8": {}}}},
    //"263": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"264": {"action": "createFrom", "options": {"convertTag": "264", "ind1": ' ', "ind2": "1", "subfields": {"a": {}, "b": {}, "c": {}, "3": {}, "6": {}, "8": {}}}},

    //"300": {"action": "createFrom", "options": {"subfields": {"a": {modifications: [{type: "replace", args: [/ [;:]$/u, ""]}, {type: "replace", args: [/ s\./u, " sivua"]}, {type: "wrap", args: ["1 verkkoaineisto (", ")"]}]}, "b": {}}}},

    //"490": {"action": "createFrom", "options": {"subfields": {"a": {}, "x": {"modifications": [{"type": "replace", "args": [/[0-9-]+/u, ""]}]}, "v": {}}}},
    // "490": { "action": "copy", "options": { "dropOriginal": true, "reduce": { "subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/ } } },

    //"5..": {"action": "copy", "options": {"copyIf": {"9": {"value": "FENNI<KEEP>"}}}},
    copy({tagPattern: new RegExp(/^5\d\d$/u, 'u')}),

    //"6..": {"action": "copy", "options": {"copyIf": {"9": {"value": "FENNI<KEEP>"}}}},
    copy({tagPattern: new RegExp(/^6\d\d$/u, 'u')}),

    //"700": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"710": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"711": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"776": {"action": "createFrom", "options": {"convertTag": "020", "ind1": " ", "ind2": " ", "subfields": {"z": {"convertCode": "a", modifications: [hyphenate]}}}},

    //"810": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"811": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"830": {"action": "createFrom", "options": {"subfields": {"a": {}, "x": {"modifications": [{"type": "replace", "args": [/[0-9-]+/u, ""]}]}, "v": {}}}},

    //"900": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP)>/u}}},
    //"910": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP)>/u}}}

    //{tag: '040', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'FI-NL'}, {code: 'b', value: 'fin'}, {code: 'e', value: 'rda'}]},
    //{tag: '042', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'finb'}]},
    //{tag: '506', ind1: '1', ind2: ' ', subfields: [{code: 'a', value: 'Aineisto on käytettävissä vapaakappalekirjastoissa.'}, {code: 'f', value: 'Online access with authorization.'}, {code: '2', value: 'star'}, {code: '5', value: 'FI-Vapaa'}, {code: '9', value: 'FENNI<KEEP>'}]},
    //{tag: '530', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'Julkaistu myös painettuna.'}, {code: '9', value: 'FENNI<KEEP>'}]},
    //{tag: '540', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'Aineisto on käytettävissä tutkimus- ja muihin tarkoituksiin;'}, {code: 'b', value: 'Kansalliskirjasto;'}, {code: 'c', value: 'Laki kulttuuriaineistojen tallettamisesta ja säilyttämisestä'}, {code: 'u', value: 'http://www.finlex.fi/fi/laki/ajantasa/2007/20071433'}, {code: '5', value: 'FI-Vapaa'}, {code: '9', value: 'FENNI<KEEP>'}]},
    //{tag: '856', ind1: '4', ind2: '0', subfields: [{code: 'u', value: ''}, {code: 'z', value: 'Käytettävissä vapaakappalekirjastoissa'}, {code: '5', value: 'FI-Vapaa'}]},
    //{tag: '901', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: new901}, {code: '5', value: 'FENNI'}]},

    insert({tag: 'LOW', subfields: [{code: 'a', value: 'KVP'}], uuid: 'a416b908-d550-4682-83c4-0ed39809a683'})
  ];

  function insert(field) {
    return (base, source) => {
      base.insertField(field);
      return base;
    };
  }

  function f041(base, source) {
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
