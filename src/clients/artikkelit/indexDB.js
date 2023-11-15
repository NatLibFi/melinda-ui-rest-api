// https://github.com/jakearchibald/idb

import {openDB} from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

const tableNames = [
  'artoAbstracts',
  'artoAuthors',
  'artoAuthorTempOrg',
  'artoMetodologys',
  'artoNotes',
  'artoOntologyWords',
  'artoOtherTitles',
  'artoOtherRatings',
  'artoRecord',
  'artoReviews',
  'artoSciences',
  'artoSources',
  'artoTempReviews',
  'artoUDKs',
];

const dbPromise = openDB('melinda-arto', 1, {
  upgrade(db) {
    tableNames.forEach(table => db.createObjectStore(table));
  }
});

export function getTableNames() {
  return tableNames;
}

export async function idbGet(tableName, key) {
  return (await dbPromise).get(tableName, key);
}

export async function idbSet(tableName, key, val) {
  return (await dbPromise).put(tableName, val, key);
}

export async function idbDel(tableName, key) {
  return (await dbPromise).delete(tableName, key);
}

export async function idbClear(tableName) {
  return (await dbPromise).clear(tableName);
}

export async function idbKeys(tableName) {
  return (await dbPromise).getAllKeys(tableName);
}

export async function idbGetStoredValues(tableName) {
  const keys = await idbKeys(tableName);
  const promises = keys.map(async key => {
    const data = await idbGet(tableName, key);
    return {key, ...data};
  });

  const results = await Promise.all(promises);
  return results;
}

export function idbAddValueToLastIndex(idbTable, value) {
  return idbKeys(idbTable).then(indexes => {
    if (indexes.length === 0) {
      return idbSet(idbTable, 1, value);
    }

    const lastIndex = [...indexes].pop();
    const newIndex = lastIndex + 1;

    return idbSet(idbTable, newIndex, value);
  });
}
