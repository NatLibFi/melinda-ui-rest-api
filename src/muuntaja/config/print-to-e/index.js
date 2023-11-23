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
import {muuntajaReducers} from '@natlibfi/melinda-marc-record-merge-reducers/dist/reducers';
import {MelindaReducers, MelindaCopyReducerConfigs} from '@natlibfi/melinda-marc-record-merge-reducers';
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

function log(opts) {
  return (base, source) => {
    logger.debug(`Base: ${JSON.stringify(base, null, 2)}`);
    return base;
  };
}

function copy(tag, opts) {
  return Reducers.copy({tagPattern: tag});
}

/*
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
*/

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

const fieldsToMerge = [
  // 001-005 ei oteta
  // 006?
  // 007 ei oteta
  // 008 otetaan 35-37 (jos sisältää dataa). Mahdollisesti muita muunnosspesifisti (008/15-17 julkaisumaa) (esim BK->CG 008/28 virallisjulkaisu)
  //010 ei oteta
  '013', // voidaan mergetä (patenttinumero, melkoisen teoreettinen)
  // 015-028 ei oteta (osaa voidaan käyttää basen 776:n generointiin)
  // 030 ei oteta?
  '031', // mergetään
  //032 ei oteta
  '033', // mergetään
  //034 ei oteta(?) (teoreettinen)
  //035 ei oteta (melinda-id voidaan laittaa luotavaan 776$w:hen)
  //036-038 ei oteta
  //039 ei oteta(?)
  '040', // mergetään, sourcen $a muuttuu $d:ksi
  '041', // otetaan (toistettava kenttä, mutta ei tehdä kahta kenttää, vaan kirjoitetaan yli, jos on. jos puuttuu, pidetään originaali)
  //042 ei oteta (?)
  '043', // otetaan
  //044 ei uskalleta ottaa
  '045', // mergetään
  //046 ei oteta, vai otetaanko joillain indikaattoreilla?
  '047', // otetaan
  '048', // otetaan
  //049 ei oteta
  //050-051 ei oteta
  //052 otetana? (marginaalinen)
  '055|056|057|058|059|060', // otetaan
  //061 ei oteta
  //066 (merkistöt) ei oteta
  //070-071 ei oteta
  '072', // otetaan
  //074 ei oteta
  '080|081|082|083|084|085|086', // otetaan
  //088 ei oteta
  '1\\d\\d', //1XX mergetään (prioriteetti tällä)
  '2[0|1|2|3|4]\\d', // 20X-24X otetaan (ainakin 245$k pitä tiputtaa pois)
  //250-270 ei oteta
  //300-340 ei oteta
  //341 saavutettavuus... pääosin jättäisin pois. pitäs ehkä ottaa osin, osin generoida, esim. $b selkokielinen vois olla pidettävä
  //342-347 ei oteta
  '348', // otetaan (?)
  //351-352 ei oteta
  //353 ei oteta (?, marginaalinen)
  '355', // otettaneen (salassapitoaste)
  //357-362 ei oteta
  //363 ei oteta(?, marginaalinen)
  //365-366 ei oteta
  '370', // iffy, sanoisin että otetaan
  '377|378|379|380|381|382|383|384', // 377-384 otetaan
  '385', // kohderyhmän ominaisuudet: otetaan, mutta saattaa tietty elää formaatista toiseen
  '386|387|388', // otetaan
  //490 ei oteta
  '500', // iffy vapaasanakenttä, ottaisin
  '501|502', // otetaan
  '504', // otetaan tekstistä toiseen, ei äänikirjaan?
  '505', // otetaan
  //506 iffy (riippuu sisällöstä), ei oteta
  //507 ei oteta
  '508', // otetaan (äänikirjasta painettuun saattaisi olla tietoja, joita ei tarvita)
  '509|510|511|512|513', // otetaan
  //514-516 ei oteta
  '518|519|520', // otetaan
  '521', // otetaan ainakin osalla, vai vaatisko jotkut ind1:n arvot erityiskäsittelyä?
  '522|523|524|525|526', // otettaneen
  //530 ei oteta (ainakaan jos itse ollaan se painettu/verkkoaineisto)
  //532-535 ei oteta
  '536', // iffy, marginaalinen, otetaan
  //538 ei oteta
  //540 ei oteta, vai olisko jotkut lisenssi sellaisia, että ne voi raahata mukaan... (public domain...)
  //541 ei oteta
  '542', // otettaneen ainakin $a:lliset
  //544-565 ei oteta (546 vähän kyllä harmittaa)
  '567', // otetaan
  //580 ei oteta
  '581', // otetaan
  //583-585 ei oteta
  '586', // otetaan
  //588 kuvailun perusta: ei oteta (vai otetaanko, vai lisätäänkö kenttään jollain sisällöllä?)
  //59X en tunne näitä kauhean hyvin
  '6\\d\\d', // 6XX otetaan kaikki
  '7[0|1|2|3|4|5]\\d' //70X-75X mergetään (tätä priorisoiden)
  //76X-78X: ei oteta, ainakaan $w-osakenttiä ei voida ottaa, Huom! 776 generoidaan emon 020-kentistä (tai 022? tai...)
  //80X-830 ei oteta
  //841-878 ei oteta
  //880 $6-osakentässä linkitetyn kentän mukaan
  //881-887 ei oteta (joku 883 $a muuntaja varmaan luodaan?)
  //9XX ei oteta
].join('|');

function mergeFields(opts) {
  return [
    //-------------------------------------------------------------------------
    //copy('003'),
    //update008(opts),

    //"020": {"action": "createFrom", "options": {"convertTag": "776", "ind1": "0", "ind2": "8", "subfields": {"i": {"replaceValue": "Painettu:"}, "a": {convertCode: "z", modifications: [{type: "replace", args: [/-/gu, ""]}]}}}},
    //update020(opts),

    //"041": {"action": "copy", "options": {"dropOriginal": true, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //copy('023')
    copy('041|080|084'),

    //"080": {"action": "copy", "options": {"copyIf": {"9": {"value": "FENNI<KEEP>"}}}},
    //"084": {"action": "copy", "options": {"copyIf": {"9": {"value": "[LOWTAG]<KEEP>"}}, "reduce": {"subfields": ["9"], "condition": "unless", "value": /[LOWTAG]<(KEEP|DROP)>/u}}},
    //copy('080'),
    //copy('084'),

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
    copy(/^5\d\d$/u),
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

//-----------------------------------------------------------------------------

function getReducers(opts) {
  return [
    //...MelindaCopyReducerConfigs.map(conf => Reducers.copy(conf)),
    ...muuntajaReducers,
    //...MelindaReducers,
    //Reducers.copy({tagPattern: fieldsToMerge}),
    //...mergeFields(opts)
    //log()
    (base, source) => base, // Dummy
    (base, source) => base // Dummy
  ];

  /*
  return [
    //...fieldsFennica(opts)
    //...MelindaMuuntajaFennicaReducers.map(conf => Reducers.copy(conf)),
    //...MelindaCopyReducerConfigs.map(conf => Reducers.copy(conf)),
    //...MelindaReducers
    //...copyReducers().map(conf => Reducers.copy(conf)),
  ];
  */
}
