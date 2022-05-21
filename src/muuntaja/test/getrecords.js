//*****************************************************************************
// Get unit test records
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {readFile} from 'fs/promises';

import {createLogger} from '@natlibfi/melinda-backend-commons';
const logger = createLogger();

export function getUnitTestRecords(testcase) {
  switch (testcase) {
  case '/01': return loadFromFiles(testcase);
  case '/f41/01': return loadFromSingleFile(testcase);
  case '/f41/02': return loadFromSingleFile(testcase);
  default: return [
    null,
    null,
    null
  ];
  }

  async function loadFromSingleFile(filename) {
    const records = await loadJSON(filename);
    //logger.debug(`Loaded: ${JSON.stringify(records, null, 2)}`);

    const {source, base, result} = records;

    return [source, base, result];
  }

  async function loadFromFiles(filename) {
    return [
      await loadJSON(`${filename}/source`),
      await loadJSON(`${filename}/base`),
      await loadJSON(`${filename}/result`)
    ];
  }

  async function loadJSON(filename) {
    try {
      const content = await readFile(`./src/muuntaja/test/${filename}.json`);
      return JSON.parse(content);
    } catch (e) {
      //return {error: e.toString()};
      return null;
    }

    /**/
  }
}
