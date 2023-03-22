import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
import {generatef100sf110sf700sf710s} from './generate1xxFields.js';

generateTests({
  callback: testF100etc,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef100'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF100etc({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');
    const result = await generatef100sf110sf700sf710s(input.authors);
    expect(result).to.deep.equal(expectedResults);
    expect(expectToFail, 'This is expected to succes').to.equal(false);
} catch (error) {
if (!expectToFail) {
  throw error;
}
expect(expectToFail, 'This is expected to fail').to.equal(true);
}
}
