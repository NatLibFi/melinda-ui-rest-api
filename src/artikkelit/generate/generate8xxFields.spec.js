import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
import {generatef856} from './generate8xxFields.js';

generateTests({
  callback: testF856,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef856'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF856({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');    
    const result = await generatef856(input.article.link, input.source.isElectronic);
    
    expect(result).to.deep.equal(expectedResults);    
    expect(expectToFail, 'This is expected to succes').to.equal(false);

  } catch (error) {
    if (!expectToFail) {
      throw error;
    }

    expect(expectToFail, 'This is expected to fail').to.equal(true);
  }

}
