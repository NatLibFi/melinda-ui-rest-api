import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
import {generatef6xxs} from './generate6xxFields.js';

generateTests({
  callback: testF6xx,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef6xx'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF6xx({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');
    const result = await generatef6xxs(input.ontologyWords);

    expect(result).to.deep.equal(expectedResults);
    expect(expectToFail, 'This is expected to succes').to.equal(false);

  } catch (error) {
    if (!expectToFail) {
      throw error;
    }

    expect(expectToFail, 'This is expected to fail').to.equal(true);
  }
}
