import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
import {generatef500, generatef506, generatef520, generatef567, generatef591} from './generate5xxFields.js';

generateTests({
  callback: testF500,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef500'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF500({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');
    const result = await generatef500(input.notes);

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
  callback: testF506,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef506'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF506({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');
    const result = await generatef506(input.article.link, input.source.isElectronic);

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
  callback: testF520,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef520'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF520({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');
    const result = await generatef520(input.abstracts);

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
  callback: testF567,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef567'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF567({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');
    const result = await generatef567(input.metodologys);

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
  callback: testF591,
  path: [__dirname, '..', '..', '..', 'test-fixtures', 'generatef591'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testF591({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');
    const result = await generatef591(input.sciences, input.article.type);

    expect(result).to.deep.equal(expectedResults);
    expect(expectToFail, 'This is expected to succes').to.equal(false);

  } catch (error) {
    if (!expectToFail) {
      throw error;
    }

    expect(expectToFail, 'This is expected to fail').to.equal(true);
  }
}

