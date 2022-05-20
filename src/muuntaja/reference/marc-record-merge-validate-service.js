/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for transforming MARC records in Melinda
*
* Copyright (C) 2015-2019 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-muuntaja
*
* melinda-muuntaja program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-muuntaja is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import _ from 'lodash';

/*

B fail: Both records have same record id
B fail: Record is deleted (source)
B fail: Record is deleted (target)
B fail: Record is suppressed (source)
B fail: Record is suppressed (target)
B fail: Both records have have LOW tag: <LOW-TAG>
B fail: Records are of different type (leader/6): <RECORD-A-LDR6> - <RECORD-B-LDR6>
H fail: record is a component record: <RECORD-ID>

B warn: Record contains long field which has been split to multiple fields. Check that it looks ok. <TAG>
B warn: Other record has LOW: FENNI, but preferred does not.


 */

const defaultPreset = [preferredRecordIsNotDeleted, otherRecordIsNotDeleted, preferredRecordIsNotSuppressed, otherRecordIsNotSuppressed, recordsHaveSameType];

export const preset = {
  melinda_host: _.concat(defaultPreset, [recordsHaveDifferentIds, preferredRecordIsNotComponentRecord, otherRecordIsNotComponentRecord]), // eslint-disable-line camelcase
  melinda_component: _.concat(defaultPreset, []), // eslint-disable-line camelcase
  melinda_warnings: [preferredRecordFromFENNI, preferredRecordHasAlephSplitFields, otherRecordHasAlephSplitFields] // eslint-disable-line camelcase
};

export function validateMergeCandidates(validationFunctions, preferredRecord, otherRecord, preferredHasSubrecords, otherRecordHasSubrecords) { // eslint-disable-line max-params
  const validationResults = validationFunctions.map(fn => fn(preferredRecord, otherRecord, preferredHasSubrecords, otherRecordHasSubrecords));
  return Promise.all(validationResults).then(results => {

    const failures = results.filter(result => result.valid === false);

    if (failures.length > 0) {
      const failureMessages = failures.map(failure => failure.validationFailureMessage);

      throw new MergeValidationError('Merge validation failed', failureMessages);
    }

    return {
      valid: true
    };
  });
}

export function recordsHaveDifferentIds(preferredRecord, otherRecord) {
  return {
    valid: getRecordId(preferredRecord) !== getRecordId(otherRecord),
    validationFailureMessage: 'Both records have the same record id'
  };
}

export function recordsHaveDifferentLOWTags(preferredRecord, otherRecord) {

  const preferredRecordLibraryTagList = getLibraryTagList(preferredRecord);
  const otherRecordLibraryTagList = getLibraryTagList(otherRecord);

  const libraryTagsInBoth = _.intersection(preferredRecordLibraryTagList, otherRecordLibraryTagList);

  return {
    valid: libraryTagsInBoth.length === 0,
    validationFailureMessage: `Both records have have LOW tags ${libraryTagsInBoth.join(', ')}`
  };
}

export function recordsHaveSameType(preferredRecord, otherRecord) {

  const preferredRecordType = preferredRecord.leader.substr(6, 1);
  const otherRecordType = otherRecord.leader.substr(6, 1);

  return {
    valid: preferredRecordType === otherRecordType,
    validationFailureMessage: `Records are of different type (leader/6): ${preferredRecordType} - ${otherRecordType}`
  };
}

export function preferredRecordIsNotDeleted(preferredRecord) {
  return {
    valid: isDeleted(preferredRecord) === false,
    validationFailureMessage: 'Preferred record is deleted'
  };
}

export function otherRecordIsNotDeleted(preferredRecord, otherRecord) {
  return {
    valid: isDeleted(otherRecord) === false,
    validationFailureMessage: 'Other record is deleted'
  };
}


export function preferredRecordIsNotSuppressed(preferredRecord) {
  return {
    valid: isSuppressed(preferredRecord) === false,
    validationFailureMessage: 'Preferred record is suppressed'
  };
}

export function otherRecordIsNotSuppressed(preferredRecord, otherRecord) {
  return {
    valid: isSuppressed(otherRecord) === false,
    validationFailureMessage: 'Other record is suppressed'
  };
}

export function preferredRecordIsNotComponentRecord(preferredRecord) {
  const recordType = preferredRecord.leader.charAt(7);
  const isComponentRecord = ['a', 'b', 'd'].some(componentRecordType => componentRecordType === recordType);
  return {
    valid: isComponentRecord === false,
    validationFailureMessage: 'Preferred record is a component record'
  };
}

export function otherRecordIsNotComponentRecord(preferredRecord, otherRecord) {
  const recordType = otherRecord.leader.charAt(7);
  const isComponentRecord = ['a', 'b', 'd'].some(componentRecordType => componentRecordType === recordType);
  return {
    valid: isComponentRecord === false,
    validationFailureMessage: 'Other record is a component record'
  };
}

export function preferredRecordDoesNotHaveSubrecords(preferredRecord, otherRecord, preferredHasSubrecords) {
  return {
    valid: preferredHasSubrecords === false,
    validationFailureMessage: 'Preferred record has subrecords'
  };
}

export function otherRecordDoesNotHaveSubrecords(preferredRecord, otherRecord, preferredHasSubrecords, otherRecordHasSubrecords) {
  return {
    valid: otherRecordHasSubrecords === false,
    validationFailureMessage: 'Other record has subrecords'
  };
}

export function preferredRecordFromFENNI(preferredRecord, otherRecord) {
  const preferredRecordLibraryTagList = getLibraryTagList(preferredRecord);
  const otherRecordLibraryTagList = getLibraryTagList(otherRecord);

  const otherHasButPreferredDoesNot = _.includes(otherRecordLibraryTagList, 'FENNI') && !_.includes(preferredRecordLibraryTagList, 'FENNI');

  return {
    valid: otherHasButPreferredDoesNot === false,
    validationFailureMessage: 'The record with FENNI LOW tag should usually be the preferred record'
  };
}

export function preferredRecordHasAlephSplitFields(preferredRecord) {
  const splitFields = preferredRecord.fields.filter(isSplitField);

  const splitFieldTags = _.uniq(splitFields.map(field => field.tag));

  return {
    valid: splitFields.length === 0,
    validationFailureMessage: `The long field ${splitFieldTags.join(', ')} in preferred record has been split to multiple fields. Check that it looks ok.`
  };
}

export function otherRecordHasAlephSplitFields(preferredRecord, otherRecord) {
  const splitFields = otherRecord.fields.filter(isSplitField);

  const splitFieldTags = _.uniq(splitFields.map(field => field.tag));

  return {
    valid: splitFields.length === 0,
    validationFailureMessage: `The long field ${splitFieldTags.join(', ')} in other record has been split to multiple fields. Check that it looks ok.`
  };
}


function isSplitField(field) {
  if (field.subfields !== undefined && field.subfields.length > 0) {
    return field.subfields[0].value.substr(0, 2) === '^^';
  }
}

function getLibraryTagList(record) {
  return _.chain(record.fields)
    .filter(field => field.tag === 'LOW')
    .flatMap(field => field.subfields.filter(subfield => subfield.code === 'a'))
    .map('value')
    .value();
}

function isSuppressed(record) {

  return _.chain(record.fields)
    .filter(field => field.tag === 'STA')
    .flatMap(field => field.subfields.filter(subfield => subfield.code === 'a'))
    .some(subfield => subfield.value.toLowerCase() === 'suppressed')
    .value();

}

function isDeleted(record) {

  if (checkLeader()) {
    return true;
  }
  if (checkDELFields()) {
    return true;
  }
  if (checkSTAFields()) {
    return true;
  }

  return false;


  function checkLeader() {
    return record.leader.substr(5, 1) === 'd';
  }

  function checkDELFields() {
    return _.chain(record.fields)
      .filter(field => field.tag === 'DEL')
      .flatMap(field => field.subfields.filter(subfield => subfield.code === 'a'))
      .some(subfield => subfield.value === 'Y')
      .value();
  }

  function checkSTAFields() {
    return _.chain(record.fields)
      .filter(field => field.tag === 'STA')
      .flatMap(field => field.subfields.filter(subfield => subfield.code === 'a'))
      .some(subfield => subfield.value.toLowerCase() === 'deleted')
      .value();
  }

}


function getRecordId(record) {
  const field001ValuesList = record.fields.filter(field => field.tag === '001').map(field => field.value);
  return _.head(field001ValuesList) || 'unknown';
}

export function MergeValidationError(message, failureMessages) {
  const temp = Error.call(this, message); // eslint-disable-line functional/immutable-data, functional/no-this-expression
  temp.name = this.name = 'MergeValidationError'; // eslint-disable-line functional/immutable-data, functional/no-this-expression, no-multi-assign
  this.stack = temp.stack; // eslint-disable-line functional/immutable-data, functional/no-this-expression
  this.message = temp.message; // eslint-disable-line functional/immutable-data, functional/no-this-expression
  this.failureMessages = failureMessages; // eslint-disable-line functional/immutable-data, functional/no-this-expression
}

MergeValidationError.prototype = Object.create(Error.prototype, { // eslint-disable-line functional/immutable-data
  constructor: {
    value: MergeValidationError,
    writable: true,
    configurable: true
  }
});
