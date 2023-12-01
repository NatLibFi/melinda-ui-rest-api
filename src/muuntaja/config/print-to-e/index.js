//*****************************************************************************
//
// Default config for p-to-e transformations
//
// See:
//
// https://workgroups.helsinki.fi/display/KST/Painetusta+e-aineistoksi+-muunnostaulukko
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {MarcRecord} from '@natlibfi/marc-record';
import {Reducers} from '@natlibfi/marc-record-merge';
//import copy from '@natlibfi/marc-record-merge/dist/reducers/copy';
//import {MelindaReducers, MelindaCopyReducerConfigs} from '@natlibfi/melinda-marc-record-merge-reducers';
//import {MelindaMuuntajaFennicaReducers} from '@natlibfi/melinda-marc-record-muuntaja-reducers'
import {update008, update020, update530, updateLOW} from './updates';
import {getDefaultValue, getFieldOrDefault} from './defaults';

import {createBase} from './createBaseRecord';
import {createLogger} from '@natlibfi/melinda-backend-commons';
const logger = createLogger();

export default {
  name: 'Oletus',
  description: 'Muunnos täydentää e-aineiston tietueen painetun aineiston tietueen tiedoilla. Luokitus- ja sisällönkuvailukentistä kopioidaan vain omalle organisaatiolle merkityt kentät. Muunnos ei käsittele osakohteita.',
  mergeType: 'printToE',

  getReducers,
  createBase
};

//-----------------------------------------------------------------------------

function getReducers(opts) {
  return [
    ...mergeFields(opts),
    ...fieldsFennica(opts)
    //...MelindaMuuntajaFennicaReducers.map(conf => Reducers.copy(conf)),
    //...MelindaCopyReducerConfigs.map(conf => Reducers.copy(conf)),
    //...MelindaReducers
    //...copyReducers().map(conf => Reducers.copy(conf)),
  ];
}

//-----------------------------------------------------------------------------

function log(opts) {
  return (base, source) => {
    logger.debug(`Base: ${JSON.stringify(base, null, 2)}`);
    return base;
  };
}

function copy(tag, opts) {
  return Reducers.copy({tagPattern: tag});
}

function insert(field) {
  return (base, source) => {
    base.insertField(field);
    return base;
  };
}

function addMissing(field, opts = {}) {
  return (base, source) => {
    const {tag} = field;
    //logger.debug(`Missing: ${JSON.stringify(field)}`);
    const [hasField] = base.get(tag);
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
// Add Fennica fields

function fieldsFennica(opts) {
  if (opts.LOWTAG !== 'FENNI') {
    return [];
  }
  return [
    fillDefault('506/FENNI'),
    //fillDefault('530/FENNI'),
    fillDefault('540/FENNI'),
    fillDefault('856/FENNI'),
    fillDefault('901/FENNI')
  ];

  function fillDefault(tag) {
    return (base, source) => {
      const field = getDefaultValue(tag, opts);
      base.insertField(field);
      return base;
    };
  }
}

//-----------------------------------------------------------------------------
// Merge fields

function mergeFields(opts) {
  return [
    //-------------------------------------------------------------------------
    //copy('003'),
    update008(opts),

    //"020": {"action": "createFrom", "options": {"convertTag": "776", "ind1": "0", "ind2": "8", "subfields": {"i": {"replaceValue": "Painettu:"}, "a": {convertCode: "z", modifications: [{type: "replace", args: [/-/gu, ""]}]}}}},
    update020(opts),

    //"041": {"action": "copy", "options": {"dropOriginal": true, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //copy('023')
    copy('041'),

    //"080": {"action": "copy", "options": {"copyIf": {"9": {"value": "FENNI<KEEP>"}}}},
    //"084": {"action": "copy", "options": {"copyIf": {"9": {"value": "[LOWTAG]<KEEP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    copy('080'),
    copy('084'),

    //-------------------------------------------------------------------------
    //"1..": {"action": "copy", "options": {"dropOriginal": true}},
    copy(/^1\d\d$/u),

    //-------------------------------------------------------------------------
    //"240": {"action": "copy", "options": {"dropOriginal": true, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"245": {"action": "copy", "options": {"dropOriginal": true, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"246": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"250": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP>)>/u}}},
    //"260": {"action": "createFrom", "options": {"convertTag": "264", "ind1": ' ', "ind2": "1", "subfields": {"a": {}, "b": {}, "c": {}, "3": {}, "6": {}, "8": {}}}},
    //"263": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"264": {"action": "createFrom", "options": {"convertTag": "264", "ind1": ' ', "ind2": "1", "subfields": {"a": {}, "b": {}, "c": {}, "3": {}, "6": {}, "8": {}}}},
    copy('240'),
    copy('245'),
    copy('246'),
    copy('250'),
    copy('260'),
    copy('263'),
    copy('264'),

    //-------------------------------------------------------------------------
    // Fyysisen kuvailun kentät 3xx:
    //"300": {"action": "createFrom", "options": {"subfields": {"a": {modifications: [{type: "replace", args: [/ [;:]$/u, ""]}, {type: "replace", args: [/ s\./u, " sivua"]}, {type: "wrap", args: ["1 verkkoaineisto (", ")"]}]}, "b": {}}}},
    //copy('300'),
    copy('336'), // compare tags only

    //-------------------------------------------------------------------------
    // Sarjamerkintökentät 4xx:
    //"490": {"action": "createFrom", "options": {"subfields": {"a": {}, "x": {"modifications": [{"type": "replace", "args": [/[0-9-]+/u, ""]}]}, "v": {}}}},
    // "490": { "action": "copy", "options": { "dropOriginal": true, "reduce": { "subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/ } } },
    copy('490'),

    //-------------------------------------------------------------------------
    // Huomautuskentät 5xx:
    //"5..": {"action": "copy", "options": {"copyIf": {"9": {"value": "FENNI<KEEP>"}}}},
    copy(/^5[0-7]\d$/u),
    opts.profile === 'KVP' ? copy(/^58[0,1,2,4,5,6,7,8,9,0]$/u) : copy(/^58\d$/u), // exclude 583 only for KVP/p2e (MUU-401)
    // 59X pois <- MUU-380

    //update530(),
    //copy(/^5\d\d$/u),

    //-------------------------------------------------------------------------
    // Asiasanakentät 6xx:
    //"6..": {"action": "copy", "options": {"copyIf": {"9": {"value": "FENNI<KEEP>"}}}},
    //copy({tagPattern: new RegExp(/^6\d\d$/u, 'u')})
    // FENNI = kopioidaan vain ne, joissa on FENNI<KEEP>
    copy(/^6\d\d$/u),

    //-------------------------------------------------------------------------
    // Lisäkirjauskentät 70x - 75x:
    //"700": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"710": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"711": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    copy('700'),
    copy('710'),
    copy('711'),

    //-------------------------------------------------------------------------
    // Linkkikentät 76x - 78x:
    //"776": {"action": "createFrom", "options": {"convertTag": "020", "ind1": " ", "ind2": " ", "subfields": {"z": {"convertCode": "a", modifications: [hyphenate]}}}},
    //copy('776'),

    //-------------------------------------------------------------------------
    // Sarjalisäkirjauskentät 80x - 830:
    //"810": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"811": {"action": "copy", "options": {"reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //"830": {"action": "createFrom", "options": {"subfields": {"a": {}, "x": {"modifications": [{"type": "replace", "args": [/[0-9-]+/u, ""]}]}, "v": {}}}},
    copy('810'),
    copy('811'),
    copy('830'),

    //-------------------------------------------------------------------------
    // Varasto- yms tietoja 841 - 88x:

    //-------------------------------------------------------------------------
    // Suomalaiset kentät 9xx:
    //"900": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP)>/u}}},
    //"910": {"action": "copy", "options": {"copyUnless": {"9": {"value": "[LOWTAG]<DROP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP)>/u}}}
    copy('900'),
    copy('910'),

    //-------------------------------------------------------------------------
    // LOW tags
    updateLOW(opts)
  ];
}
