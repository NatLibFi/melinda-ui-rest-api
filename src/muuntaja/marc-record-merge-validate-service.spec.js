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
import * as MarcRecordMergeValidateService from './marc-record-merge-validate-service';
import MarcRecord from 'marc-record-js';

const TEST_CASE_SEPARATOR = '\n\n\n\n';

const storiesPath = path.resolve(__dirname, '../test/marc-record-merge-validate-service');

describe('marc-record-merge-validate-service', () => {

  const files = fs.readdirSync(storiesPath);
  const storyFiles = files.filter(filename => filename.substr(-6) === '.story').sort();

  storyFiles.map(loadStoriesFromFile).forEach(testSuite => {

    describe(testSuite.suiteName, () => {

      testSuite.testCases.forEach(testCase => {

        it(testCase.testName, () => {

          const {valid, validationFailureMessage} = testSuite.functionUnderTest.call(null, testCase.preferredRecord, testCase.otherRecord, testCase.preferredRecordHasSubrecords, testCase.otherRecordHasSubrecords);

          expect(valid, `Expected test case validation to be ${testCase.isValid}`).to.equal(testCase.isValid);
          if (testCase.isValid === false) { // eslint-disable-line functional/no-conditional-statement
            expect(validationFailureMessage).to.equal(testCase.failureMessage);
          }

        });
      });
    });
  });

  describe('validateMergeCandidates', () => {
    const validateStoriesText = fs.readFileSync(path.resolve(storiesPath, 'validateMergeCandidates.stories'), 'utf8');
    const validateMergeCandidatesTestCases = parseStories(validateStoriesText);
    const allValidations = _.concat(MarcRecordMergeValidateService.preset.melinda_host, MarcRecordMergeValidateService.preset.melinda_warnings);

    validateMergeCandidatesTestCases.forEach(testCase => {
      let result; // eslint-disable-line functional/no-let
      let error; // eslint-disable-line functional/no-let
      before(() => MarcRecordMergeValidateService.validateMergeCandidates(allValidations, testCase.preferredRecord, testCase.otherRecord, testCase.preferredRecordHasSubrecords, testCase.otherRecordHasSubrecords)
        .then(_result => result = _result) // eslint-disable-line no-return-assign
        .catch(_error => error = _error)); // eslint-disable-line no-return-assign

      it(testCase.testName, () => {

        if (testCase.isValid) { // eslint-disable-line functional/no-conditional-statement
          expect(result.valid, `Expected test case validation to be ${testCase.isValid}`).to.equal(testCase.isValid);
        } else { // eslint-disable-line functional/no-conditional-statement
          expect(error.message).to.equal('Merge validation failed');
          expect(error.failureMessages).to.eql(testCase.failureMessages);
        }

      });


    });

  });

});

function loadStoriesFromFile(filename) {

  const storyText = fs.readFileSync(path.resolve(storiesPath, filename), 'utf8');

  const fnName = filename.slice(0, -6);
  const functionUnderTest = MarcRecordMergeValidateService[fnName];
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

      const isValid = _.chain(lines)
        .map(line => (/Expected to be valid:\s*(true|false)/u).exec(line)) // eslint-disable-line prefer-named-capture-group
        .filter(matchResult => matchResult !== null)
        .map(matchResult => matchResult[1])
        .map(boolAsString => boolAsString === 'true')
        .head()
        .value();

      const preferredRecordHasSubrecords = _.chain(lines)
        .map(line => (/Preferred has subrecords:\s*(true|false)/u).exec(line)) // eslint-disable-line prefer-named-capture-group
        .filter(matchResult => matchResult !== null)
        .map(matchResult => matchResult[1])
        .map(boolAsString => boolAsString === 'true')
        .head()
        .defaultTo(false)
        .value();

      const otherRecordHasSubrecords = _.chain(lines)
        .map(line => (/Other has subrecords:\s*(true|false)/u).exec(line)) // eslint-disable-line prefer-named-capture-group
        .filter(matchResult => matchResult !== null)
        .map(matchResult => matchResult[1])
        .map(boolAsString => boolAsString === 'true')
        .head()
        .defaultTo(false)
        .value();

      const failureMessages = _.chain(lines)
        .map(line => (/Expected failure message:\s*(.*)/u).exec(line)) // eslint-disable-line prefer-named-capture-group
        .filter(matchResult => matchResult !== null)
        .map(matchResult => matchResult[1])
        .value();

      const failureMessage = _.head(failureMessages);


      return {testName, preferredRecord, preferredRecordHasSubrecords, otherRecordHasSubrecords, otherRecord, isValid, failureMessage, failureMessages};
    });

}
