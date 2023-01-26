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
import {createArtikkelitService} from './artikkelitService.js';

generateTests({
  callback,
  path: [__dirname, '..', 'test-fixtures', 'transform'],
  useMetadataFile: true,
  recurse: false,
  fixura: {
    reader: READERS.JSON
  }
});

async function callback({getFixture, enabled = true}) {
  if (enabled === false) {
    return;
  }

  const importResults = getFixture('input.json');
  const expectedResults = getFixture('output.json');
  const transform = createArtikkelitService('000101'); //param: useMoment

  const handledRecords = await transform.generateRecord(importResults);
  expect(handledRecords).to.deep.equal(expectedResults);

}

