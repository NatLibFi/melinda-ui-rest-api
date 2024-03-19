//*****************************************************************************
//
// Merging fields 500 - 599
//
//*****************************************************************************

/* eslint-disable no-unused-vars, array-bracket-newline */

import {Reducers} from '@natlibfi/marc-record-merge';

//-------------------------------------------------------------------------
// Huomautuskentät 5xx:
//"5..": {"action": "copy", "options": {"copyIf": {"9": {"value": "FENNI<KEEP>"}}}},

const fieldsAlways = [
  '501|502', // otetaan
  // 503
  '504', // otetaan tekstistä toiseen, ei äänikirjaan?
  '505', // otetaan
  //506 iffy (riippuu sisällöstä), ei oteta
  '508', // otetaan (äänikirjasta painettuun saattaisi olla tietoja, joita ei tarvita)
  '509',
  '510|511|512|513', // otetaan
  //514-516 ei oteta
  '517|518|519',
  //'520', // otetaan
  //'521', // otetaan ainakin osalla, vai vaatisko jotkut ind1:n arvot erityiskäsittelyä?
  //'522|523|524|525|526', // otettaneen
  '52\\d'
].join('|');

const fieldsP2E = [
  fieldsAlways,
  '500', // iffy vapaasanakenttä, ottaisin
  //507 ei oteta
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
  '586' // otetaan
  //588 kuvailun perusta: ei oteta (vai otetaanko, vai lisätäänkö kenttään jollain sisällöllä?)
  //59X - excluded (MUU-379) en tunne näitä kauhean hyvin
].join('|');

const fieldsE2PCommon = [
  fieldsAlways,
  // 500 - exclude (MUU-379)
  // 506 - exclude (MUU-382)
  '507',
  '514',
  '515',
  // 516 - exclude (MUU-383)
  '54[1-9]', // exclude 540 (MUU-378)
  '55\\d',
  '56\\d',
  '58[0,1,2,4,5,6,7,9]', // exclude 588 (MUU-377)
  '583' // ??? MUU-401
  // /^59\d$/u, // excludes all 59x (MUU-380 & MUU-410)
].join('|');

const fieldsE2PDefault = [
  fieldsE2PCommon
].join('|');

const fieldsE2PFenni = [
  fieldsE2PCommon
].join('|');

/*
const fieldsE2P = [
  opts.profile === 'KVP' ? copy(/^53[0,1,2,4,5,6,7,9]$/u) : copy(/^53\d$/u), // exclude 538 when KVP/p2e (MUU-408)
  opts.profile === 'KVP' ? copy(/^57[0,1,2,3,4,5,6,7,8]$/u) : copy(/^57\d$/u), // exclude 579 when KVP/e2p (MUU-409)
].join('|');
*/

export function merge5XX(opts) {

  if (opts.type === 'e2p') {
    if (opts.profile === 'FENNI') {
      return [Reducers.copy({tagPattern: fieldsE2PFenni})];
    }
    return [Reducers.copy({tagPattern: fieldsE2PDefault})];
  }

  return [Reducers.copy({tagPattern: fieldsP2E})];
  //return [];
}
