import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
import {generatef041, generatef080, generatef084} from './generate0xxFields.js';

generateTests({
  callback: testF041,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef041'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF041({getFixture}) {
  const input = getFixture('input.json');
  const expectedResults = getFixture('output.json');
  const result = await generatef041(input.articleLanguage, input.abstractLanguages);

  expect(result).to.deep.equal(expectedResults);
}

generateTests({
  callback: testF080,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef080'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF080({getFixture}) {
  const input = getFixture('input.json');
  const expectedResults = getFixture('output.json');
  const result = await generatef080(input.udks);

  expect(result).to.deep.equal(expectedResults);
}


generateTests({
  callback: testF084,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef084'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF084({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');
    const result = await generatef084(input.otherRatings);

    expect(result).to.deep.equal(expectedResults);
    expect(expectToFail, 'This is expected to succes').to.equal(false);

  } catch (error) {
    if (!expectToFail) {
      throw error;
    }

    expect(expectToFail, 'This is expected to fail').to.equal(true);
  }
}
