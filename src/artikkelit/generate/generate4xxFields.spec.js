import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
import {generatef490} from './generate4xxFields.js';

generateTests({
  callback: testF490,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'artikkelit', 'generatef490'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF490({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');
    const result = await generatef490(input.article.sectionOrColumn);

    expect(result).to.deep.equal(expectedResults);
    expect(expectToFail, 'This is expected to succes').to.equal(false);

  } catch (error) {
    if (!expectToFail) {
      throw error;
    }

    expect(expectToFail, 'This is expected to fail').to.equal(true);
  }
}
