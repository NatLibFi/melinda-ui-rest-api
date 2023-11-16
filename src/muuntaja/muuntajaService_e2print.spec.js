import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {getResultRecord} from './muuntajaService.js';
const logger = createLogger();

generateTests({
  callback: testTransform,
  path: [__dirname, '..', '..', 'test-fixtures', 'muuntaja', 'e2print'],
  useMetadataFile: true,
  recurse: true,
  fixura: {
    reader: READERS.JSON
  }
});

function testTransform({getFixture, testBase = false, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
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

