/******************************************************************************
 *
 * Services for muuntaja
 *
 ******************************************************************************
 */

import express, {Router} from 'express';
//import HttpStatus from 'http-status';
//import {Error as APIError} from '@natlibfi/melinda-commons';
import {createLogger} from '@natlibfi/melinda-backend-commons';
//import defaults from 'defaults';
//import createClient from '@natlibfi/sru-client';
//import {MARCXML} from '@natlibfi/marc-record-serializers';

// https://github.com/NatLibFi/marc-record-serializers

// Make this a list. Give the records names meant for menu. Add transform options to list.
// Add handling those to UI

const baseRecords = {
  overwrites: {
    leader: '00000cam^a22006134i^4500',
    fields: [
      {tag: '001', value: '000000000'},
      {tag: '007', value: 'cr^||^||||||||'},
      {tag: '008', value: '^^^^^^s2018^^^^fi^||||^o^^^^^|0|^0|fin|^'},
      {tag: '337', subfields: [
        {code: 'a', value: 'tietokonekäyttöinen'},
        {code: 'b', value: 'c'},
        {code: '2', value: 'rdamedia'}
      ]},
      {tag: '338', subfields: [
        {code: 'a', value: 'verkkoaineisto'},
        {code: 'b', value: 'cr'},
        {code: '2', value: 'rdacarrier'}
      ]}
    ]
  },
  defaults: {
    fields: [
      {tag: '020', subfields: [
        {code: 'a', value: ''},
        {code: 'q', value: 'PDF'}
      ]},
      {tag: '041', ind1: '0', subfields: [{code: 'a', value: 'eng'}]}
    ]
  }
};

export default function (jwtOptions) { // eslint-disable-line no-unused-vars
  const logger = createLogger();
  logger.debug('Creating muuntaja route');

  return new Router()
    .get('/base', getBaseRecords)
    .use(express.json())
    .post('/merge', doMerge)
    .use(handleError);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  function getBaseRecords(req, res) {
    res.json(baseRecords);
  }

  function doMerge(req, res) {

    logger.debug(`Merge`);

    const {source, defaults, overwrites} = req.body;

    //logger.debug(JSON.stringify(source));
    //logger.debug(JSON.stringify(base.overwrites));

    const merged = mergeRecords(defaults, source, overwrites);

    logger.debug(JSON.stringify(merged));

    res.json(merged);

    function mergeRecords(...records) {
      logger.debug(records);
      return records.reduce((a, b) => mergeFields(a, b));
    }

    function mergeFields(base, overwrites) { // eslint-disable-line no-unused-vars
      const tags = overwrites.fields.map(field => field.tag);

      return {
        leader: overwrites.leader ? overwrites.leader : base.leader,
        fields: base.fields.filter(field => !tags.includes(field.tag)).concat(overwrites.fields)
      };
    }
  }
}
