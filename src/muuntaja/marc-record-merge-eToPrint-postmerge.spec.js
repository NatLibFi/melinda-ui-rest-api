/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for transforming MARC records in Melinda
*
* Copyright (C) 2015-2019 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-muuntaja
*
* melinda-muuntaja program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-muuntaja is distributed in the hope that it will be useful,
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
import _ from 'lodash';
import {expect} from 'chai';
import path from 'path';
import fs from 'fs';
import * as MarcRecordMergePostmergeService from './marc-record-merge-postmerge-service';
import * as eToPrintPostmerge from './config/e-to-print/postmerge/eToPrint-postmerge.js';

import MarcRecord from '@natlibfi/marc-record';

const TEST_CASE_SEPARATOR = '\n\n\n\n';

const storiesPath = path.resolve(__dirname, '../test/marc-record-merge-eToPrint-postmerge');

describe('marc-record-merge-eToPrint-postmerge', () => {

  const files = fs.readdirSync(storiesPath);
  const storyFiles = files.filter(filename => filename.substr(-6) === '.story').sort();

  storyFiles.map(loadStoriesFromFile).forEach(testSuite => {

    describe(testSuite.suiteName, () => {

      testSuite.testCases.forEach(testCase => {

        it(testCase.testName, () => {
          const {mergedRecord, notes} = testSuite.functionUnderTest.call(null, testCase.preferredRecord, testCase.otherRecord, testCase.mergedRecord);

          // console.log('mergedRecord(2): ', mergedRecord.toString());
          // console.log('expected: ', testCase.expectedMergedRecord.toString());

          expect(mergedRecord.toString()).to.eql(testCase.expectedMergedRecord.toString());
          expect(notes || []).to.eql(testCase.notes);

        });
      });
    });
  });

  describe('applyPostMergeModifications', () => {
    const validateStoriesText = fs.readFileSync(path.resolve(storiesPath, 'applyPostMergeModifications.stories'), 'utf8');
    const validateMergeCandidatesTestCases = parseStories(validateStoriesText);

    validateMergeCandidatesTestCases.forEach(testCase => {

      it(testCase.testName, () => {

        const postMergeFixers = MarcRecordMergePostmergeService.preset.eToPrintPreset;
        const {record, notes} = MarcRecordMergePostmergeService.applyPostMergeModifications(postMergeFixers, testCase.preferredRecord, testCase.otherRecord, testCase.mergedRecord);

        expect(record.toString()).to.eql(testCase.expectedMergedRecord.toString());
        expect(notes).to.eql(testCase.notes);

      });
    });
  });
});

function loadStoriesFromFile(filename) {
  const storyText = fs.readFileSync(path.resolve(storiesPath, filename), 'utf8');

  const fnName = filename.slice(0, -6);
  const functionUnderTest = eToPrintPostmerge[fnName];
  const suiteName = fnName;

  const testCases = parseStories(storyText);
  return {suiteName, functionUnderTest, testCases};

}

function parseStories(storyText) {
  return storyText.split(TEST_CASE_SEPARATOR)
    .map(story => story.trim())
    .map(story => { // eslint-disable-line max-statements
      const lines = story.split('\n').map(line => line.trim());
      const testName = lines[0]; // eslint-disable-line prefer-destructuring
      const preferredRecordRaw = lines.slice(2, lines.indexOf('')).join('\n');
      const preferredRecord = MarcRecord.fromString(preferredRecordRaw);

      const otherRecordStartIndex = lines.indexOf('Other record:') + 1;
      const otherRecordRaw = lines.slice(otherRecordStartIndex, lines.indexOf('', otherRecordStartIndex)).join('\n');
      const otherRecord = MarcRecord.fromString(otherRecordRaw);

      const mergedRecordStartIndex = lines.indexOf('Merged record before postmerge:') + 1;
      const mergedRecordRaw = lines.slice(mergedRecordStartIndex, lines.indexOf('', mergedRecordStartIndex)).join('\n');

      const mergedRecord = MarcRecord.fromString(mergedRecordRaw);

      const expectedMergedRecordStartIndex = lines.indexOf('Expected record after postmerge:') + 1;
      const expectedMergedRecordEndIndex = lines.indexOf('', expectedMergedRecordStartIndex) === -1 ? lines.length : lines.indexOf('', expectedMergedRecordStartIndex);
      const expectedMergedRecordRaw = lines.slice(expectedMergedRecordStartIndex, expectedMergedRecordEndIndex).join('\n');
      const expectedMergedRecord = MarcRecord.fromString(expectedMergedRecordRaw);

      const notes = _.chain(lines)
        .map(line => (/Notes:\s*(.*)/u).exec(line)) // eslint-disable-line prefer-named-capture-group
        .filter(matchResult => matchResult !== null)
        .map(matchResult => matchResult[1])
        .value();

      return {testName, preferredRecord, otherRecord, mergedRecord, expectedMergedRecord, notes};
    });

}

/*
function fieldsEqual(fieldA, fieldB) {
  if (fieldA.tag !== fieldB.tag) {
    return false;
  }
  if (fieldA.ind1 !== fieldB.ind1) {
    return false;
  }
  if (fieldA.ind2 !== fieldB.ind2) {
    return false;
  }
  if (fieldA.subfields && fieldB.subfields) {
    return _.zip(fieldA.subfields, fieldB.subfields).every(pair => pair[0].code === pair[1].code && pair[0].value === pair[1].value);

  }
  return fieldA.value === fieldB.value;
}
*/
