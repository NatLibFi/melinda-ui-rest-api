/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* ONIX record transformer for the Melinda record batch import system
*
* Copyright (C) 2019-2020 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-record-import-transformer-onix
*
* melinda-record-import-transformer-onix program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-record-import-transformer-onix is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen';
//import createDebugLogger from 'debug';
import {Error as TransformationError} from '@natlibfi/melinda-commons';

import {generateRecord} from './artikkelitService.js'; // ***

//const debug = createDebugLogger('@natlibfi/melinda-record-import-transformer-onix:transform/index.SPEC');

generateTests({
  callback,
  path: [__dirname, '..', '..', 'test-fixtures', 'transform'],
  recurse: false,
  useMetadataFile: true,
  fixura: {
    failWhenNotFound: false
  }
});

function callback({
  getFixture,
  enabled = true,
  expectedError = false,
  expectedErrorStatus = '200'
}) {
  if (enabled === false) {
    throw new Error('DISABLED');
  }

  const inputData = getFixture({components: ['input.json'], reader: READERS.JSON});
  const expectedRecord = getFixture({components: ['output.json'], reader: READERS.JSON});

  return new Promise((resolve, reject) => {
    const results = [];

    generateRecord(inputData) //ex-transform(inputData)
      .on('error', err => {
        //debug(err);
        if (expectedError) { // eslint-disable-line functional/no-conditional-statement
          try {
            expect(err).to.be.an('error');
            if (err instanceof TransformationError) {
              expect(err.payload).to.match(new RegExp(expectedError, 'u'));
              expect(err.status).to.match(new RegExp(expectedErrorStatus, 'u'));
              return resolve();
            }

            expect(err.message).to.match(new RegExp(expectedError, 'u'));
            return resolve();
          } catch (err) {
            return reject(err);
          }
        }

        reject(err);
      })
      .on('record', r => results.push(r)) // eslint-disable-line functional/immutable-data
      .on('end', async () => {
        try {
          await Promise.all(results);
          //debug(results);
          expect(results).to.have.lengthOf(1);
          expect(results[0].failed).to.eql(expectedRecord.failed);
          expect(results[0].message).to.eql(expectedRecord.message);
          if (!expectedRecord.failed) { // eslint-disable-line functional/no-conditional-statement
            expect(results[0].record).to.deep.include(expectedRecord.record);
            resolve();
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      });

  });

}
