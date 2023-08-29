
import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
import {generatef008} from './generateControlFields.js';
import {getSourceTypeAsText} from './../artikkelitService.js';

generateTests({
  callback: testF008,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef008'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});
async function testF008({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');
    const result = await generatef008('Jun 14th 23', input.journalNumber.publishingYear, getSourceTypeAsText(input.source), input.source.isElectronic, input.article.language);

    expect(result).to.deep.equal(expectedResults);
    expect(expectToFail, 'This is expected to succes').to.equal(false);

  } catch (error) {
    if (!expectToFail) {
      throw error;
    }
    expect(expectToFail, 'This is expected to fail').to.equal(true);
  }
}
