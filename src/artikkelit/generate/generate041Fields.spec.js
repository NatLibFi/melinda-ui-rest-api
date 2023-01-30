import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
import {generatef041} from './generate0xxFields.js';

generateTests({
  callback,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef041'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function callback({getFixture}) {
  const input = getFixture('input.json');
  const expectedResults = getFixture('output.json');
  const result = await generatef041(input.articleLanguage, input.abstractLanguages);

  expect(result).to.deep.equal(expectedResults);
}

