/******************************************************************************
 *
 * Common for transforms
 *
 ******************************************************************************
 */

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
