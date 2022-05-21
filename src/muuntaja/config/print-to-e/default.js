//*****************************************************************************
//
// Default config for p-to-e transformations
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';
import {Reducers} from '@natlibfi/marc-record-merge';
//import copy from '@natlibfi/marc-record-merge/dist/reducers/copy';
//import {MelindaReducers, MelindaCopyReducerConfigs} from '@natlibfi/melinda-marc-record-merge-reducers';
//import {MelindaMuuntajaFennicaReducers} from '@natlibfi/melinda-marc-record-muuntaja-reducers'

import {createBase} from './baseRecord';
import {createLogger} from '@natlibfi/melinda-backend-commons';
const logger = createLogger();

export default {
  name: 'Oletus',
  description: 'Muunnos täydentää e-aineiston tietueen painetun aineiston tietueen tiedoilla. Luokitus- ja sisällönkuvailukentistä kopioidaan vain omalle organisaatiolle merkityt kentät. Muunnos ei käsittele osakohteita.',
  mergeType: 'printToE',

  getReducers,
  createBase,

  baseValidators: {
    subfieldValues: false
  },
  sourceValidators: {
    subfieldValues: false
  }
};

//-----------------------------------------------------------------------------

function getReducers(opts) {
  return [
    ...controlReducers(opts),
    ...localReducers(opts)
  ];
}

//...MelindaMuuntajaFennicaReducers.map(conf => Reducers.copy(conf)),
//...MelindaCopyReducerConfigs.map(conf => Reducers.copy(conf)),
//...MelindaReducers
//...copyReducers().map(conf => Reducers.copy(conf)),

//-----------------------------------------------------------------------------

function controlReducers(opts) {
  return [
    // Copy language tags before processing
    Reducers.copy({tagPattern: new RegExp(/^041$/u, 'u'), compareTagsOnly: true}),

    // Control fields
    Reducers.copy({tagPattern: /^001$/u, compareTagsOnly: true}),
    Reducers.copy({tagPattern: /^002$/u, compareTagsOnly: true}),
    Reducers.copy({tagPattern: /^003$/u, compareTagsOnly: true}),
    Reducers.copy({tagPattern: /^004$/u, compareTagsOnly: true}),
    //Reducers.copy({tagPattern: /^005$/u, compareTagsOnly: true}),
    Reducers.copy({tagPattern: /^006$/u, compareTagsOnly: true}),
    Reducers.copy({tagPattern: /^007$/u, compareTagsOnly: true}),
    Reducers.copy({tagPattern: /^008$/u, compareTagsOnly: true}),
    Reducers.copy({tagPattern: /^009$/u, compareTagsOnly: true})
  ];
}

//-----------------------------------------------------------------------------

function localReducers(opts) {
  return [
    //replace({tag: '001', value: 'N/A'}),

    //"020": {"action": "createFrom", "options": {"convertTag": "776", "ind1": "0", "ind2": "8", "subfields": {"i": {"replaceValue": "Painettu:"}, "a": {convertCode: "z", modifications: [{type: "replace", args: [/-/gu, ""]}]}}}},
    //"041": {"action": "copy", "options": {"dropOriginal": true, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //copy({tagPattern: new RegExp(/^041$/u, 'u'), compareTagsOnly: true}),

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

    //-------------------------------------------------------------------------
    /* New fields */

    //{tag: '040', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'FI-NL'}, {code: 'b', value: 'fin'}, {code: 'e', value: 'rda'}]},
    //{tag: '042', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'finb'}]},
    //{tag: '506', ind1: '1', ind2: ' ', subfields: [{code: 'a', value: 'Aineisto on käytettävissä vapaakappalekirjastoissa.'}, {code: 'f', value: 'Online access with authorization.'}, {code: '2', value: 'star'}, {code: '5', value: 'FI-Vapaa'}, {code: '9', value: 'FENNI<KEEP>'}]},
    //{tag: '530', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'Julkaistu myös painettuna.'}, {code: '9', value: 'FENNI<KEEP>'}]},
    //{tag: '540', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'Aineisto on käytettävissä tutkimus- ja muihin tarkoituksiin;'}, {code: 'b', value: 'Kansalliskirjasto;'}, {code: 'c', value: 'Laki kulttuuriaineistojen tallettamisesta ja säilyttämisestä'}, {code: 'u', value: 'http://www.finlex.fi/fi/laki/ajantasa/2007/20071433'}, {code: '5', value: 'FI-Vapaa'}, {code: '9', value: 'FENNI<KEEP>'}]},
    //{tag: '856', ind1: '4', ind2: '0', subfields: [{code: 'u', value: ''}, {code: 'z', value: 'Käytettävissä vapaakappalekirjastoissa'}, {code: '5', value: 'FI-Vapaa'}]},
    //{tag: '901', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: new901}, {code: '5', value: 'FENNI'}]},

    //insert({tag: '001', value: 'N/A'}),
    addLOW(opts)
  ];
}

function copy(options) {
  return Reducers.copy(options);
}

function insert(field) {
  return (base, source) => {
    base.insertField(field);
    return base;
  };
}

/*
function replace(field) {
  return (base, source) => {
    const {tag} = field;
    return new MarcRecord({
      leader: base.leader,
      fields: base.fields.map(f => f.tag === tag ? field : f)
    });
  };
}
*/

//-----------------------------------------------------------------------------

function addLOW(opts) {
  return (base, source) => {
    const {LOW} = opts;
    if (!LOW) {
      return base;
    }

    const subfield = {code: 'a', value: LOW};

    // Check if it already exists in base LOW
    const hasLOW = base.containsFieldWithValue('LOW', [subfield]);
    //logger.debug(`LOW: ${LOW} -> ${JSON.stringify(hasLOW)}`);

    if (!hasLOW) {
      base.insertField({tag: 'LOW', subfields: [subfield]}); //, uuid: 'a416b908-d550-4682-83c4-0ed39809a683'});
      return base;
    }
    return base;
  };
}

//-----------------------------------------------------------------------------

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
