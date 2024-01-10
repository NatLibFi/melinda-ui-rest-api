/* eslint-disable no-console */
import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
import {getResultRecord} from './muuntajaService.js';

//-----------------------------------------------------------------------------
// Test case generation
//-----------------------------------------------------------------------------

generateTests({
  callback: testTransform,
  path: [__dirname, '..', '..', 'test-fixtures', 'muuntaja', 'e2print'],
  useMetadataFile: true,
  recurse: true,
  fixura: {
    reader: READERS.JSON
  }
});

generateTests({
  callback: testTransform,
  path: [__dirname, '..', '..', 'test-fixtures', 'muuntaja', 'print2e'],
  useMetadataFile: true,
  recurse: true,
  fixura: {
    reader: READERS.JSON
  }
});

//-----------------------------------------------------------------------------
// Test function
//-----------------------------------------------------------------------------

function testTransform({getFixture, testBase = false, mockYear = undefined, expectToFail = false}) {
  try {

    const input = getFixture('input.json');

    //'mockYear' is used only in testing
    // and only for those default field values in record generation
    // which would otherwise automatically use the current year.
    // Variable 'mockYear' is defined in test's metadata.json
    // and passed as input's options property 'year'
    if (mockYear) { // eslint-disable-line functional/no-conditional-statements
      input.options.year = mockYear; // eslint-disable-line functional/immutable-data
    }

    const expectedResult = getFixture('output.json');
    const {base, result} = getResultRecord(input);

    expect(testBase ? base : result).to.deep.equal(expectedResult);
    expect(expectToFail, 'This is expected to succes').to.equal(false);

  } catch (error) {
    if (!expectToFail) {
      throw error;
    }

    expect(expectToFail, 'This is expected to fail').to.equal(true);
  }
}

