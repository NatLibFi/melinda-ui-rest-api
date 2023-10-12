import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
import {generateDummyFunc} from './generateDummy.js';
import {createLogger} from '@natlibfi/melinda-backend-commons';

const logger = createLogger();

generateTests({
  callback: testDum,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generateDummy'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testDum({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');
    const result = await generateDummyFunc(input.base.ID);
      
    expect(result).to.deep.equal(expectedResults);
    expect(expectToFail, 'This is expected to succes').to.equal(false);

  } catch (error) {
    if (!expectToFail) {
      throw error;
    }

    expect(expectToFail, 'This is expected to fail').to.equal(true);
  }
}

