/* eslint-disable no-console */
import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
import {getResultRecord} from './muuntajaService.js';
import {createLogger} from '@natlibfi/melinda-backend-commons/dist/utils.js';

//-----------------------------------------------------------------------------
// Test case generation
//-----------------------------------------------------------------------------

generateTests({
  callback: testTransform,
  path: [__dirname, '..', '..', 'test-fixtures', 'muuntaja', 'print2e'],
  useMetadataFile: true,
  recurse: true,
  fixura: {
    reader: READERS.JSON
  }
});

generateTests({
  callback: testTransform,
  path: [__dirname, '..', '..', 'test-fixtures', 'muuntaja', 'e2print'],
  useMetadataFile: true,
  recurse: true,
  fixura: {
    reader: READERS.JSON
  }
});

const logger = createLogger(); // eslint-disable-line no-unused-vars

//-----------------------------------------------------------------------------
// Test function
//-----------------------------------------------------------------------------

function testTransform({getFixture, testBase = false, expectToFail = false}) {
  try {

    const input = getFixture('input.json');

    // When setting options' property 'dateFormat' with value 'test'
    //   - default field value generating functions do not use current date
    //   - instead mock date '20380119' will be used for record default field generation
    input.options.dateFormat = 'test'; // eslint-disable-line functional/immutable-data

    const expectedResult = getFixture('output.json');
    const {base, result} = getResultRecord(input);

    //logger.debug(`Source: ${JSON.stringify(input.source, null, 2)}`);
    //logger.debug(`Base..: ${JSON.stringify(input.base, null, 2)}`);
    //logger.debug(`Result: ${JSON.stringify(result, null, 2)}`);
    //logger.debug(`Expect: ${JSON.stringify(expectedResult, null, 2)}`);

    expect(testBase ? base : result).to.deep.equal(expectedResult);
    expect(expectToFail, 'This is expected to succes').to.equal(false);

  } catch (error) {
    if (!expectToFail) {
      throw error;
    }

    expect(expectToFail, 'This is expected to fail').to.equal(true);
  }
}

