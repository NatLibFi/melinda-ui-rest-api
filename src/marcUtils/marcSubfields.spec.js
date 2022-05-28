/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import generateTests from '@natlibfi/fixugen';
import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import createDebugLogger from 'debug';

const debug = createDebugLogger('@natlibfi/marcUtils/marcSubfields.spec.js');

describe('marcSubfields', () => {

  /*
  generateTests({
    callback,
    path: [__dirname, '..', 'test-fixtures', 'marcSubfields'],
    useMetadataFile: true,
    recurse: false,
    fixura: {
      reader: READERS.JSON,
      failWhenNotFound: false
    }
  });

  function callback({getFixture, disabled}) {

    //const rec = new MarcRecord(getFixture('input.json'));
    //const sorted = rec.sortFields();
    //expect(sorted).to.eql(new MarcRecord(getFixture('result.json')));
  }
  */
});
