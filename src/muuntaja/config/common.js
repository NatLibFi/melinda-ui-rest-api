//******************************************************************************
//
// Common for transforms
//
// *****************************************************************************

import {readEnvironmentVariable} from '@natlibfi/melinda-backend-commons';
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


// if environment is test
//   - returns the year that is given as options property 'year'
// otherwise returns the current year in format YYYY as integer
export function getYear(options) {
  const environment = readEnvironmentVariable('NODE_ENV');

  // only used for tests
  if (environment === 'test') {
    return options.year;
  }

  return moment().format('YYYY');
}

// if environment is test
//   - returns the year month and day that is given as options property 'yearMonthDay'
// otherwise returns the current year, month and day in format YYYYMMDD as integer
export function getYearMonthDay(options) {
  const environment = readEnvironmentVariable('NODE_ENV');

  // only used for tests
  if (environment === 'test') {
    return options.yearMonthDay;
  }

  return moment().format('YYYYMMDD');
}
