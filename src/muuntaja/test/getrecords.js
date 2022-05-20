//*****************************************************************************
// Get unit test records
//*****************************************************************************

import {readFile} from 'fs/promises';

export function getUnitTestRecords(testcase, baseDefault) {
  switch (testcase) {
  case '/01': return loadFromFiles(testcase);
  case '/f41/01': return loadFromSingleFile(testcase);
  default: return [
    null,
    null,
    null
  ];
  }

  async function loadFromSingleFile(filename) {
    const {source, base, result} = await loadJSON(filename);

    return [
      {record: source},
      {record: base ? base : baseDefault},
      {record: result}
    ];
  }

  async function loadFromFiles(filename) {
    return [
      await loadJSON(`${filename}/source`),
      await loadJSON(`${filename}/base`, baseDefault),
      await loadJSON(`${filename}/result`)
    ];
  }

  async function loadJSON(filename, _default = null) {
    try {
      const content = await readFile(`./src/muuntaja/test/${filename}.json`);
      return JSON.parse(content);
    } catch (e) {
      if (_default) {
        return {record: _default};
      }
      return {error: e.toString()};
    }
  }
}
