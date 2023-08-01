import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
import {generatef773,generatef787} from './generate7xxFields.js';

import {getSourceTypeAsText, parseIncomingData} from './../artikkelitService.js';

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
    const result = await generatef773(getSourceTypeAsText(input.source), {publishingYear, volume, number, pages}, melindaId, isbn, issn, input.source.sourceType, input.source.title);

    expect(result).to.deep.equal(expectedResults);
    expect(expectToFail, 'This is expected to succes').to.equal(false);

  } catch (error) {
    if (!expectToFail) {
      throw error;
    }

    expect(expectToFail, 'This is expected to fail').to.equal(true);
  }
}

generateTests({
  callback: testF787,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef787'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF787({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');
    const result = await generatef787(input.reviews);
   
    expect(result).to.deep.equal(expectedResults);
    expect(expectToFail, 'This is expected to succes').to.equal(false);

  } catch (error) {
    if (!expectToFail) {
      throw error;
    }

    expect(expectToFail, 'This is expected to fail').to.equal(true);
  }
}