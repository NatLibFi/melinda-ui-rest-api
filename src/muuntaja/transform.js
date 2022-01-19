import _ from 'lodash';
import {MarcRecord} from '@natlibfi/marc-record';
//import createRecordMerger from '@natlibfi/marc-record-merge';
import {createRecordMerger} from './marc-record-merge';
import * as MergeValidation from './marc-record-merge-validate-service';
import * as PostMerge from './marc-record-merge-postmerge-service';

export async function transformRecord(logger, transformProfile, sourceRecord, baseRecord) { // eslint-disable-line max-statements

  //logger.debug(`transformRecord`);

  const transformConfiguration = transformProfile.mergeConfiguration;
  const {validationRules} = transformProfile;
  const {postMergeFixes} = transformProfile;
  const {newFields} = transformProfile;

  // Melinda-commons / subrecord picker
  const sourceRecordHasSubrecords = false;
  const baseRecordHasSubrecords = false;

  //logger.debug(`Transform profile: ${JSON.stringify(transformProfile, null, 2)}`);
  //logger.debug(`Transform record: ${JSON.stringify(transformRecord, null, 2)}`);

  //logger.debug(JSON.stringify(sourceRecord));
  //logger.debug(`Transform profile: ${JSON.stringify(transformProfile)}`);
  //logger.debug(`Base record: ${JSON.stringify(baseRecord)}`);

  //logger.debug(`Config: ${JSON.stringify(transformConfiguration, null, 2)}`);
  //logger.debug(`Validation: ${JSON.stringify(validationRules)}`);

  /*
  // Transform type & profile
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
  */

  /*
  const validationRulesClone = _.clone(validationRules);
  if (subrecordMergeType === subrecordMergeTypes.DISALLOW_SUBRECORDS) {
    validationRulesClone.push(MergeValidation.otherRecordDoesNotHaveSubrecords);
    validationRulesClone.push(MergeValidation.preferredRecordDoesNotHaveSubrecords);
  }
  */

  try {
    await MergeValidation.validateMergeCandidates(validationRules, baseRecord, sourceRecord, baseRecordHasSubrecords, sourceRecordHasSubrecords);
  } catch (e) {
    return {error: `${e.message}: ${e.failureMessages}`};
  }

  function appendNewFields(originalMergedRecord) {
    if (!newFields) {
      return originalMergedRecord;
    }

    const mergedRecord = new MarcRecord(originalMergedRecord);

    newFields.forEach(field => {
      const fields = mergedRecord.fields.filter(fieldInMerged => field.tag === fieldInMerged.tag && _.isEqual(field.subfields, fieldInMerged.subfields));

      if (fields.length === 0) { // eslint-disable-line functional/no-conditional-statement
        mergedRecord.appendField(field);
      }
    });

    return mergedRecord;
  }

  const merge = createRecordMerger(transformConfiguration);
  const mergedRecord = appendNewFields(merge(baseRecord, sourceRecord));
  const postMerged = PostMerge.applyPostMergeModifications(postMergeFixes, baseRecord, sourceRecord, mergedRecord);

  return {
    notes: postMerged.notes,
    record: postMerged.record
  };

  /*
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
  //return mergedRecord;
}
