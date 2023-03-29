// https://github.com/jakearchibald/idb

import {openDB} from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

const dbName = 'melinda-logs';
const dbVersion = 1;

const dbPromise = openDB(dbName, dbVersion, {
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

  let db = null;
  const request = indexedDB.open(dbName, dbVersion);

  request.onerror = (event) => {
    console.error(`Error in opening indexedDB '${dbName}' version '${dbVersion}':`, event.target.error);
    console.log(`Note for Firefox and Edge users: Viewer can not be used in private browsing mode`)
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    const version = db.version;
    const storeNames = [...db.objectStoreNames];

    console.log('IndexedDB version: ', version);
    console.log('IndexedDB stores: ',storeNames);

  }

}
