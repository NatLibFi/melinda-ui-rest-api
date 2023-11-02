import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';

//import {generateNewFunc} from './generateTest.js';
import {createMuuntajaService, getResultRecord} from './muuntajaService.js';




generateTests({
  callback: testDum,
  path: [__dirname, '..', '..', 'test-fixtures', 'muuntaja', 'generateNew'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function testDum({getFixture, expectToFail = false}) {
  try {
    const input = getFixture('input.json');
    const expectedResults = getFixture('output.json');

    //{profile, source, base, options, include, exclude, replace} 
    const result = getResultRecord(input);    
    //const result = await getResultRecord(input);    
    //console.log('   ***  ---> OUTPUT ,  function gives this: --->',  JSON.stringify(result, null, " " )); // eslint-disable-line
    expect(result).to.deep.equal(expectedResults);    
    expect(expectToFail, 'This is expected to succes').to.equal(false);

  } catch (error) {
    if (!expectToFail) {
      throw error;
    }

    expect(expectToFail, 'This is expected to fail').to.equal(true);
  }
}

