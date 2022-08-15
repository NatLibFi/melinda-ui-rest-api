// https://github.com/jakearchibald/idb

import {openDB} from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

const dbPromise = openDB('melinda-logs', 1, {
  upgrade(db) {
    db.createObjectStore('logs');
  },
});

export async function idbGet(key) {
  return (await dbPromise).get('logs', key);
};

export async function idbSet(key, val) {
  return (await dbPromise).put('logs', val, key);
};

export async function idbDel(key) {
  return (await dbPromise).delete('logs', key);
};

export async function idbClear() {
  return (await dbPromise).clear('logs');
};

export async function idbKeys() {
  return (await dbPromise).getAllKeys('logs');
};
