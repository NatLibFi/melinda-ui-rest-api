// https://github.com/jakearchibald/idb

import {openDB} from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

const tableNames = ['artoSources', 'artoAuthors']

const dbPromise = openDB('melinda', 1, {
  upgrade(db) {
    db.createObjectStore('artoSources');
    db.createObjectStore('artoAuthors');
  }
});

export function getTableNames(){
  return tableNames;
}

export async function idbGet(tableName, key) {
  return (await dbPromise).get(tableName, key);
};

export async function idbSet(tableName, key, val) {
  return (await dbPromise).put(tableName, val, key);
};

export async function idbDel(tableName, key) {
  return (await dbPromise).delete(tableName, key);
};

export async function idbClear(tableName) {
  return (await dbPromise).clear(tableName);
};

export async function idbKeys(tableName) {
  return (await dbPromise).getAllKeys(tableName);
};
