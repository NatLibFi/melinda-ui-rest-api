//*****************************************************************************
//
// Merging fields 000 - 099
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {Reducers} from '@natlibfi/marc-record-merge';
import {generate020} from '../special/gen020';

const fieldsToMerge = [
  // 001-005 ei oteta
  // 006?
  // 007 ei oteta
  // 008 otetaan 35-37 (jos sisältää dataa). Mahdollisesti muita muunnosspesifisti (008/15-17 julkaisumaa) (esim BK->CG 008/28 virallisjulkaisu)
  //010 ei oteta
  '013', // voidaan mergetä (patenttinumero, melkoisen teoreettinen)
  // 020 generoidaan
  // 015-028 ei oteta (osaa voidaan käyttää basen 776:n generointiin)
  // 030 ei oteta?
  '031', // mergetään
  //032 ei oteta
  '033', // mergetään
  //034 ei oteta(?) (teoreettinen)
  //035 ei oteta (melinda-id voidaan laittaa luotavaan 776$w:hen)
  //036-038 ei oteta
  //039 ei oteta(?)
  //'040', // mergetään, sourcen $a muuttuu $d:ksi
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
  '080|081|082|083|084|085|086' // otetaan
  //088 ei oteta
].join('|');

export function merge0XX(opts) {
  return [Reducers.copy({tagPattern: fieldsToMerge})];
}
