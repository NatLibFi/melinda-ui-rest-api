import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
import {generatef336, generatef380} from './generate3xxFields.js';

generateTests({
  callback: testF336,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef336'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF336({getFixture, expectToFail = false}) {
  try {
    const expectedResults = getFixture('output.json');
    const result = await generatef336(); //  constant value, no input needed

    expect(result).to.deep.equal(expectedResults);


  } catch (error) {
    if (!expectToFail) {
      throw error;
    }

    expect(expectToFail, 'This is expected to fail').to.equal(true);
  }
}

generateTests({
  callback: testF380,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef380'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF380({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');
    const result = await generatef380(input.article.reviewType);

    expect(result).to.deep.equal(expectedResults);
    expect(expectToFail, 'This is expected to succes').to.equal(false);

  } catch (error) {
    if (!expectToFail) {
      throw error;
    }

    expect(expectToFail, 'This is expected to fail').to.equal(true);
  }
}
