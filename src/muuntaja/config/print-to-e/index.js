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
    ...mergeFields(opts),
    ...missingFields(opts)
    //...MelindaMuuntajaFennicaReducers.map(conf => Reducers.copy(conf)),
    //...MelindaCopyReducerConfigs.map(conf => Reducers.copy(conf)),
    //...MelindaReducers
    //...copyReducers().map(conf => Reducers.copy(conf)),
  ];
}

//-----------------------------------------------------------------------------

function merge(tag) {
  return Reducers.copy({tagPattern: tag});

  /*
  return (base, source) => {
    const fields = source.get(tag);
    fields.map(f => base.insertField(f));
    return base;
  };
  */
}

function insert(field) {
  return (base, source) => {
    base.insertField(field);
    return base;
  };
}

function missing(field, opts = {}) {
  return (base, source) => {
    const {tag, subfields} = field;
    const hasField = base.containsFieldWithValue(tag, [opts.compareTagsOnly ? null : subfields]);
    if (!hasField) {
      base.insertField(field);
      return base;
    }
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
// Add missing fields

function missingFields(opts) {
  const {LOWTAG} = opts;
  const fields1 = [LOWTAG ? {tag: 'LOW', subfields: [{code: 'a', value: LOWTAG}]} : null].filter(f => f).map(f => missing(f));
  const fields2 = [
    {tag: '040', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'FI-NL'}, {code: 'b', value: 'fin'}, {code: 'e', value: 'rda'}]},
    {tag: '042', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'finb'}]},
    {tag: '530', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'Julkaistu myös painettuna.'}, {code: '9', value: 'FENNI<KEEP>'}]}
  ].filter(f => f).map(f => missing(f, {compareTagsOnly: true}));
  const fenni = [
    {tag: '506', ind1: '1', ind2: ' ', subfields: [{code: 'a', value: 'Aineisto on käytettävissä vapaakappalekirjastoissa.'}, {code: 'f', value: 'Online access with authorization.'}, {code: '2', value: 'star'}, {code: '5', value: 'FI-Vapaa'}, {code: '9', value: 'FENNI<KEEP>'}]},
    {tag: '540', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'Aineisto on käytettävissä tutkimus- ja muihin tarkoituksiin;'}, {code: 'b', value: 'Kansalliskirjasto;'}, {code: 'c', value: 'Laki kulttuuriaineistojen tallettamisesta ja säilyttämisestä'}, {code: 'u', value: 'http://www.finlex.fi/fi/laki/ajantasa/2007/20071433'}, {code: '5', value: 'FI-Vapaa'}, {code: '9', value: 'FENNI<KEEP>'}]},
    {tag: '856', ind1: '4', ind2: '0', subfields: [{code: 'u', value: ''}, {code: 'z', value: 'Käytettävissä vapaakappalekirjastoissa'}, {code: '5', value: 'FI-Vapaa'}]},
    {tag: '901', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'SUyyyyMMDD'}, {code: '5', value: 'FENNI'}]}
  ].filter(f => f).map(f => missing(f, {compareTagsOnly: true}));

  return [
    ...fields1,
    ...fields2,
    ...LOWTAG === 'FENNI' ? fenni : []
  ];
}

//-----------------------------------------------------------------------------
// Merge fields

function mergeFields(opts) {
  return [
    ...controlReducers(opts),
    ...localReducers(opts)
  ];
}

//-----------------------------------------------------------------------------

function controlReducers(opts) {
  return [];
  // Control fields
  //Reducers.copy({tagPattern: /^001$/u, compareTagsOnly: true}),
  //Reducers.copy({tagPattern: /^002$/u, compareTagsOnly: true}),
  //Reducers.copy({tagPattern: /^003$/u, compareTagsOnly: true}),
  //Reducers.copy({tagPattern: /^004$/u, compareTagsOnly: true}),
  //Reducers.copy({tagPattern: /^005$/u, compareTagsOnly: true}),
  //Reducers.copy({tagPattern: /^006$/u, compareTagsOnly: true}),
  //Reducers.copy({tagPattern: /^007$/u, compareTagsOnly: true}),
  //Reducers.copy({tagPattern: /^008$/u, compareTagsOnly: true}),
  //Reducers.copy({tagPattern: /^009$/u, compareTagsOnly: true})
}

//-----------------------------------------------------------------------------

function localReducers(opts) {
  return [
    //-------------------------------------------------------------------------
    //"020": {"action": "createFrom", "options": {"convertTag": "776", "ind1": "0", "ind2": "8", "subfields": {"i": {"replaceValue": "Painettu:"}, "a": {convertCode: "z", modifications: [{type: "replace", args: [/-/gu, ""]}]}}}},
    //"041": {"action": "copy", "options": {"dropOriginal": true, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},

    //"080": {"action": "copy", "options": {"copyIf": {"9": {"value": "FENNI<KEEP>"}}}},
    //"084": {"action": "copy", "options": {"copyIf": {"9": {"value": "[LOWTAG]<KEEP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    merge('080'),
    merge('084'),

    //-------------------------------------------------------------------------
    //"1..": {"action": "copy", "options": {"dropOriginal": true}},
    merge(/^1\d\d$/u),

    //-------------------------------------------------------------------------
    //"240": {"action": "copy", "options": {"dropOriginal": true, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"245": {"action": "copy", "options": {"dropOriginal": true, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"246": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"250": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP>)>/u}}},
    //"260": {"action": "createFrom", "options": {"convertTag": "264", "ind1": ' ', "ind2": "1", "subfields": {"a": {}, "b": {}, "c": {}, "3": {}, "6": {}, "8": {}}}},
    //"263": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"264": {"action": "createFrom", "options": {"convertTag": "264", "ind1": ' ', "ind2": "1", "subfields": {"a": {}, "b": {}, "c": {}, "3": {}, "6": {}, "8": {}}}},
    merge('240'),
    merge('245'),
    merge('246'),
    merge('250'),
    merge('260'),
    merge('263'),
    merge('264'),

    //-------------------------------------------------------------------------
    // Fyysisen kuvailun kentät 3xx:
    //"300": {"action": "createFrom", "options": {"subfields": {"a": {modifications: [{type: "replace", args: [/ [;:]$/u, ""]}, {type: "replace", args: [/ s\./u, " sivua"]}, {type: "wrap", args: ["1 verkkoaineisto (", ")"]}]}, "b": {}}}},
    merge('300'),
    merge('336'),

    //-------------------------------------------------------------------------
    // Sarjamerkintökentät 4xx:
    //"490": {"action": "createFrom", "options": {"subfields": {"a": {}, "x": {"modifications": [{"type": "replace", "args": [/[0-9-]+/u, ""]}]}, "v": {}}}},
    // "490": { "action": "copy", "options": { "dropOriginal": true, "reduce": { "subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/ } } },
    merge('490'),

    //-------------------------------------------------------------------------
    // Huomautuskentät 5xx:
    //"5..": {"action": "copy", "options": {"copyIf": {"9": {"value": "FENNI<KEEP>"}}}},
    merge(/^5\d\d$/u),
    //copy({tagPattern: new RegExp(/^5\d\d$/u, 'u')}),

    //-------------------------------------------------------------------------
    // Asiasanakentät 6xx:
    //"6..": {"action": "copy", "options": {"copyIf": {"9": {"value": "FENNI<KEEP>"}}}},
    //copy({tagPattern: new RegExp(/^6\d\d$/u, 'u')})
    /* FENNI = kopioidaan vain ne, joissa on FENNI<KEEP> */
    merge(/^6\d\d$/u),

    //-------------------------------------------------------------------------
    // Lisäkirjauskentät 70x - 75x:
    //"700": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"710": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"711": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    merge('700'),
    merge('710'),
    merge('711'),

    //-------------------------------------------------------------------------
    // Linkkikentät 76x - 78x:
    //"776": {"action": "createFrom", "options": {"convertTag": "020", "ind1": " ", "ind2": " ", "subfields": {"z": {"convertCode": "a", modifications: [hyphenate]}}}},
    merge('776'),

    //-------------------------------------------------------------------------
    // Sarjalisäkirjauskentät 80x - 830:
    //"810": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"811": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"830": {"action": "createFrom", "options": {"subfields": {"a": {}, "x": {"modifications": [{"type": "replace", "args": [/[0-9-]+/u, ""]}]}, "v": {}}}},
    merge('810'),
    merge('811'),
    merge('830'),

    //-------------------------------------------------------------------------
    // Varasto- yms tietoja 841 - 88x:

    //-------------------------------------------------------------------------
    // Suomalaiset kentät 9xx:
    //"900": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP)>/u}}},
    //"910": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP)>/u}}}
    merge('900'),
    merge('910')
  ];
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
