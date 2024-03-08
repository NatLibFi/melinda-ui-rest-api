//*****************************************************************************
//
// Merging fields 300 - 399
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {Reducers} from '@natlibfi/marc-record-merge';

const defaultFields = [
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
  '386|387|388' // otetaan
].join('|');

const fenniFields = [
  //-------------------------------------------------------------------------
  // Fyysisen kuvailun kentät 3xx:
  //"300": {"action": "createFrom", "options": {"subfields": {"a": {modifications: [{type: "replace", args: [/ [;:]$/u, ""]}, {type: "replace", args: [/ s\./u, " sivua"]}, {type: "wrap", args: ["1 verkkoaineisto (", ")"]}]}, "b": {}}}},
  //opts.profile === 'KVP' ? '300' : /^39\d$/u, // add 300 when KVP/e2p; 39x is nonexistent; used as a placeholder
  '336' // compare tags only
].join('|');

export function merge3XX(opts) {
  if (opts.profile === 'FENNI') {
    return [Reducers.copy({tagPattern: fenniFields})];
  }
  return [Reducers.copy({tagPattern: defaultFields})];
}
