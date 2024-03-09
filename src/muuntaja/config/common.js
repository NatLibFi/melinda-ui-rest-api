/* eslint-disable no-console */
//******************************************************************************
//
// Common for transforms
//
// *****************************************************************************

import moment from 'moment';


export const validationOff = {
  fields: false, // Do not allow record without fields
  subfields: false, // Do not allow empty subfields
  subfieldValues: false, // Do not allow subfields without value
  controlFieldValues: false, // Do not allow controlFields without value
  leader: false, // Do not allow record without leader, with empty leader or with leader with length != 24
  characters: false, // Do not allow erronous characters in tags, indicators and subfield codes
  noControlCharacters: false, // Do not allow ASCII control characters in field/subfield values
  noAdditionalProperties: false, // Do not allow additional properties in fields
  strict: false // If true, set all validationOptions to true
};

// if function getDate is called with 'dateFormat' parameter value 'test':
//   - returns string '20380119'
//   - this date is used in test-fixtures
// otherwise:
//    - returns the current date as string
//    - the requested formatting is given as parameter
//    - default formatting is 'YYYYMMDD'

export function getDate(dateFormat = 'YYYYMMDD') {

  if (dateFormat === 'test') {
    return '20380119';
  }

  return moment().format(dateFormat).toString();
}

// Library marking for 008: FENNI -> empty, others -> c

export function get008LibraryID(opts) {
  return opts.profile === 'FENNI' ? '^' : 'c';
}
