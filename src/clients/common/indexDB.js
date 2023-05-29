// https://github.com/jakearchibald/idb

import {openDB} from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

export function createDbOperator(tableName) {
  const dbPromise = openDB('melinda', 1, {
    upgrade(db) {
      db.createObjectStore(tableName);
    }
  });

  return {idbGet, idbSet, idbDel, idbClear, idbKeys};

  async function idbGet(key) {
    return (await dbPromise).get(tableName, key);
  }

  async function idbSet(key, val) {
    return (await dbPromise).put(tableName, val, key);
  }

  async function idbDel(key) {
    return (await dbPromise).delete(tableName, key);
  }

  async function idbClear() {
    return (await dbPromise).clear(tableName);
  }

  async function idbKeys() {
    return (await dbPromise).getAllKeys(tableName);
  }
}
