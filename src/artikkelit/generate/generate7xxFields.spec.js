import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
import {generatef773} from './generate7xxFields.js';

import {getSourceType, parseIncomingData} from './../artikkelitService.js';

generateTests({
  callback: testF773,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef773'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF773({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');

    const {issn, melindaId} = parseIncomingData(input.source);
    const isbn = '951-isbn';
    const {publishingYear, volume, number, pages} = input.journalNumber;
    const result = await generatef773(getSourceType(input.source), {publishingYear, volume, number, pages}, melindaId, isbn, issn, input.source.sourceType, input.source.title);

    expect(result).to.deep.equal(expectedResults);
    expect(expectToFail, 'This is expected to succes').to.equal(false);

  } catch (error) {
    if (!expectToFail) {
      throw error;
    }

    expect(expectToFail, 'This is expected to fail').to.equal(true);
  }


}
