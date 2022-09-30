/******************************************************************************
 *
 * Record fetching and modifying for UIs
 *
 ******************************************************************************
 */

/* eslint-disable no-unused-vars */

import HttpStatus from 'http-status';
import {Router} from 'express';
//import {Error as APIError} from '@natlibfi/melinda-commons';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {createOntologyService} from './ontologyService';

//import createClient from '@natlibfi/sru-client';
//import {MARCXML} from '@natlibfi/marc-record-serializers';

// https://github.com/NatLibFi/marc-record-serializers

export default function (fintoUrl) { // eslint-disable-line no-unused-vars
  const logger = createLogger();
  const ontologyService = createOntologyService(fintoUrl);

  return new Router()
    .get('/:language/:ontology/:query', searchOntologyTerms)
    .use(handleError);

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }

  async function searchOntologyTerms(req, res, next) {
    try {
      //logger.debug(data);
      const {language, ontology, query} = req.params;
      const results = await ontologyService.getOntologyData(language, ontology, query);
      logger.verbose('Ontologies querried...');

      res.json(results);
    } catch (error) {
      console.log(error); // eslint-disable-line
      return next(error);
    }
  }
}
