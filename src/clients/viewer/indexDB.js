// https://github.com/jakearchibald/idb

import {openDB} from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

const dbPromise = openDB('melinda-logs', 1, {
  upgrade(db) {
    db.createObjectStore('logs');
    db.createObjectStore('list');
  },
});

//-----------------------------------------------------------------------------
// idb functions for one set of logs
//-----------------------------------------------------------------------------

export async function idbGetLogs(key) {
  return (await dbPromise).get('logs', key);
};

export async function idbSetLogs(key, val) {
  return (await dbPromise).put('logs', val, key);
};

export async function idbDelLogs(key) {
  return (await dbPromise).delete('logs', key);
};

export async function idbClearLogs() {
  return (await dbPromise).clear('logs');
};

export async function idbKeysLogs() {
  return (await dbPromise).getAllKeys('logs');
};


//-----------------------------------------------------------------------------
// idb functions for the correlation id list
//-----------------------------------------------------------------------------

export async function idbGetList(key) {
  return (await dbPromise).get('list', key);
};

export async function idbSetList(key, val) {
  return (await dbPromise).put('list', val, key);
};

export async function idbClearList() {
  return (await dbPromise).clear('list');
};


//-----------------------------------------------------------------------------
// function to check the status of user's indexed db storage
//-----------------------------------------------------------------------------

export function doIndexedDbCheck() {
  console.log('Checking idb storage...')
}
