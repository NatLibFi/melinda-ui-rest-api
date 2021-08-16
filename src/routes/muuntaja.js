/******************************************************************************
 *
 * Services for muuntaja
 *
 ******************************************************************************
 */

//import HttpStatus from 'http-status';
import {Router} from 'express';
//import {Error as APIError} from '@natlibfi/melinda-commons';
import {createLogger} from '@natlibfi/melinda-backend-commons';
//import createClient from '@natlibfi/sru-client';
//import {MARCXML} from '@natlibfi/marc-record-serializers';

// https://github.com/NatLibFi/marc-record-serializers

const baseRecords = {
  leader: '00000cam^a22006134i^4500',
  fields: [
    {tag: '001', value: '000000000'},
    {tag: '007', value: 'cr^||^||||||||'},
    {tag: '008', value: '^^^^^^s2018^^^^fi^||||^o^^^^^|0|^0|fin|^'},
    {tag: '020', subfields: [
      {code: 'a', value: ''},
      {code: 'q', value: 'PDF'}
    ]},
    {tag: '041', ind1: '0', subfields: [{code: 'a', value: 'eng'}]},
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
};

export default function (jwtOptions) { // eslint-disable-line no-unused-vars
  const logger = createLogger();
  logger.debug('Creating muuntaja route');

  return new Router()
    .get('/base', getBaseRecords)
    .use(handleError);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  function getBaseRecords(req, res) {
    logger.debug(`Test`);
    //res.sendStatus(HttpStatus.NO_CONTENT);
    res.json(baseRecords);
  }
}
