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
import {printToE} from './config/config-presets';

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

    // Muuta ID:eiksi.

    const {defaults, source, overwrites} = req.body; // eslint-disable-line
    // validate source, validate base

    //logger.debug(JSON.stringify(base.overwrites));

    const merged = mergeRecords(source);

    //logger.debug(JSON.stringify(merged));

    res.json(merged);
  }

  //-----------------------------------------------------------------------------

  function mergeRecords(sourceRecord) {

    logger.debug(`update merged record`);
    logger.debug(JSON.stringify(sourceRecord));

    /* These will be delivered from frontend: */

    const transformType = printToE;
    const transformProfile = transformType.defaults; // eslint-disable-line
    const {baseRecord} = transformType; // eslint-disable-line

    logger.debug(`Transform profile: ${JSON.stringify(transformProfile)}`);
    logger.debug(`Base record: ${JSON.stringify(baseRecord)}`);

    /*
    const getMergeProfile = getState().getIn(['config', 'mergeProfiles', getState().getIn(['config', 'selectedMergeProfile']), 'record']);
    const defaultProfile = getState().getIn(['config', 'mergeProfiles']);
    const mergeProfile = getMergeProfile === undefined ? defaultProfile.first() : getMergeProfile;
    const subrecordMergeType = getState().getIn(['config', 'mergeProfiles', getState().getIn(['config', 'selectedMergeProfile']), 'subrecords', 'mergeType']);

    const mergeConfiguration = mergeProfile.get('mergeConfiguration');
    const validationRules = mergeProfile.get('validationRules');
    const postMergeFixes = mergeProfile.get('postMergeFixes');
    const newFields = mergeProfile.get('newFields');

    //const preferredState = getState().getIn(['targetRecord', 'state']);
    const baseRecord = preferredState === 'EMPTY' ? mergeProfile.get('targetRecord') : getState().getIn(['targetRecord', 'record']);
    //const preferredHasSubrecords = preferredState === 'EMPTY' ? false : getState().getIn(['targetRecord', 'hasSubrecords']);

    //const sourceRecord = getState().getIn(['sourceRecord', 'record']);
    //const otherRecordHasSubrecords = getState().getIn(['sourceRecord', 'hasSubrecords']);

    if (baseRecord && sourceRecord) { //targetRecord and sourceRecord
      const merge = createRecordMerger(mergeConfiguration);
      const validationRulesClone = _.clone(validationRules);
      if (subrecordMergeType === subrecordMergeTypes.DISALLOW_SUBRECORDS) {
        validationRulesClone.push(MergeValidation.otherRecordDoesNotHaveSubrecords);
        validationRulesClone.push(MergeValidation.preferredRecordDoesNotHaveSubrecords);
      }

      MergeValidation.validateMergeCandidates(validationRulesClone, baseRecord, sourceRecord, preferredHasSubrecords, otherRecordHasSubrecords)
        .then(() => merge(baseRecord, sourceRecord))
        .then((originalMergedRecord) => {
          if (!newFields) {
            return originalMergedRecord;
          }

          const mergedRecord = new MarcRecord(originalMergedRecord);

          newFields.forEach(field => {
            const fields = mergedRecord.fields.filter(fieldInMerged => field.tag === fieldInMerged.tag && _.isEqual(field.subfields, fieldInMerged.subfields));

            if (fields.length === 0) {
              mergedRecord.appendField({...field, uuid: uuid.v4()});
            }
          });

          return mergedRecord;
        })
        .then(mergedRecord => PostMerge.applyPostMergeModifications(postMergeFixes, baseRecord, sourceRecord, mergedRecord))
        .then(result => {
          dispatch(setMergedRecord(result.record));
        })
        .catch(exceptCoreErrors(error => {
          dispatch(setMergedRecordError(error));
        }));

      // find pairs for subrecods
      const sourceSubrecordList = sourceSubrecords(getState());
      const targetSubrecordList = targetSubrecords(getState());

      const matchedSubrecordPairs = match(sourceSubrecordList, targetSubrecordList);

      dispatch(updateSubrecordArrangement(matchedSubrecordPairs));

      if (subrecordMergeType === subrecordMergeTypes.MERGE || subrecordMergeType === subrecordMergeTypes.SHARED) {
        dispatch(updateMergedSubrecords(matchedSubrecordPairs));
      }
    }

    /**/
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
