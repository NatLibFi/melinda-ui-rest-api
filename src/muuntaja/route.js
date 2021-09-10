/******************************************************************************
 *
 * Services for muuntaja
 *
 ******************************************************************************
 */

/* eslint-disable no-unused-vars */

import express, {Router} from 'express';
//import HttpStatus from 'http-status';
//import {Error as APIError} from '@natlibfi/melinda-commons';
import {createLogger} from '@natlibfi/melinda-backend-commons';
//import defaults from 'defaults';
//import createClient from '@natlibfi/sru-client';
//import {MARCXML} from '@natlibfi/marc-record-serializers';
import {transformRecord} from './transform';

// https://github.com/NatLibFi/marc-record-serializers

// Make this a list. Give the records names meant for menu. Add transform options to list.
// Add handling those to UI

/* Base records have two parts:
   1. defaults, which fill possible missing fields in source record, and
   2. overwrites, which overwrite fields in source record.
*/

const baseRecords = {
  overwrites: {
    leader: '00000cam^a22006134i^4500',
    fields: [
      {tag: '001', value: '000000000'},
      {tag: '007', value: 'cr^||^||||||||'},
      {tag: '008', value: '^^^^^^s2018^^^^fi^||||^o^^^^^|0|^0|fin|^'},
      {
        tag: '337', subfields: [
          {code: 'a', value: 'tietokonekäyttöinen'},
          {code: 'b', value: 'c'},
          {code: '2', value: 'rdamedia'}
        ]
      },
      {
        tag: '338', subfields: [
          {code: 'a', value: 'verkkoaineisto'},
          {code: 'b', value: 'cr'},
          {code: '2', value: 'rdacarrier'}
        ]
      }
    ]
  },
  defaults: {
    fields: [
      {
        tag: '020', subfields: [
          {code: 'a', value: ''},
          {code: 'q', value: 'PDF'}
        ]
      },
      {tag: '041', ind1: '0', subfields: [{code: 'a', value: 'eng'}]}
    ]
  }
};

/*
const options = {
  "type": [{
    displayName: "...",
    description: "...",
    value: "e2p"
  }]
  profile: {

  }
}

{
  type: "e2p",
  profile: "fdsfd"
  source:
  base:
}
*/

/* Changes applied to merged record in any case */
/*
const mergeDefaults =
{
  overwrites: {
    fields: [{tag: '001', value: '000000000'}]
  },
  defaults: {
    fields: []
  }
};
*/

export default function (jwtOptions) { // eslint-disable-line no-unused-vars
  const logger = createLogger();
  logger.debug('Creating muuntaja route');

  return new Router()
    .get('/base', getBaseRecords)
    .use(express.json())
    .post('/transform', doTransform)
    .use(handleError);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  function getBaseRecords(req, res) {
    res.json(baseRecords);
  }

  async function doTransform(req, res) {

    logger.debug(`Transform`);

    // Muuta ID:eiksi.

    const {defaults, source, overwrites} = req.body; // eslint-disable-line
    // validate source, validate base

    //logger.debug(JSON.stringify(base.overwrites));

    const merged = await transformRecord(logger, source);

    //logger.debug(JSON.stringify(merged));

    res.json(merged);
  }
}

//-----------------------------------------------------------------------------

// Jos base on haettu kannasta, niin ID säilyy
// Uudella tietueella CAT häviää

// Osakohteet (pidä mielessä)

// Add field sort:
/* Field sort: muuntaja/frontend/js/marc-field-sort.js */

// Recordin käsittely:
// https://github.com/NatLibFi/marc-record-merge-js/tree/next/src/reducers
