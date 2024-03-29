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
import {merge0XX} from './merge/fields0XX';
import {merge1XX} from './merge/fields1XX';
import {merge2XX} from './merge/fields2XX';
import {merge3XX} from './merge/fields3XX';
import {merge4XX} from './merge/fields4XX';
import {merge5XX} from './merge/fields5XX';
import {merge6XX} from './merge/fields6XX';
import {merge7XX} from './merge/fields7XX';
import {merge8XX} from './merge/fields8XX';
import {merge9XX} from './merge/fields9XX';
import {getFenniFields} from './merge/fieldsFenni';
import {generateLOW} from './special/genLOW';
import {generate020} from './special/gen020';
import {generate776} from './special/gen776';

import {p2eBaseRecord} from './baserecord/print2e';
import {e2pBaseRecord} from './baserecord/e2print';
import {createLogger} from '@natlibfi/melinda-backend-commons';

const logger = createLogger();

const mergeProfile = {
  name: 'Merge',
  description: 'Yhdistää kaksi tietuetta toisiinsa',

  //getReducers: opts => [],
  getReducers: opts => MelindaReducers,
  createBase: opts => undefined
};

const p2eProfile = {
  name: 'Oletus',
  description: 'Muunnos täydentää e-aineiston tietueen painetun aineiston tietueen tiedoilla. Luokitus- ja sisällönkuvailukentistä kopioidaan vain omalle organisaatiolle merkityt kentät. Muunnos ei käsittele osakohteita.',

  getReducers,
  createBase: p2eBaseRecord
};

const e2pProfile = {
  name: 'Oletus',
  description: 'Muunnos täydentää painetun aineiston tietueen e-aineiston tietueen tiedoilla. Muunnos ei käsittele osakohteita.',

  getReducers,
  createBase: e2pBaseRecord
};

export const profiles = {
  'p2e': p2eProfile,
  'e2p': e2pProfile,
  'merge': mergeProfile
};

function getReducers(opts) {

  return [
    merge0XX(opts),
    merge1XX(opts),
    merge2XX(opts),
    merge3XX(opts),
    merge4XX(opts),
    merge5XX(opts),
    merge6XX(opts),
    merge7XX(opts),
    merge8XX(opts),
    merge9XX(opts),
    generate020(opts),
    generate776(opts),
    getFenniFields(opts)
    //generateLOW(opts)
  ].flat();
}
