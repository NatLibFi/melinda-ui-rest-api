//simple cache for storing data temporarily and to prevent load buildup
const cache = {};

/**
 * Function to give cache functionality to any data fetch.
 *
 * @param {object} paramObj object delivery for function
 * @param {String} paramObj.key some key so value can be stored in cache
 * @param {function(): Promise<*>} paramObj.onNewDataRequired function that returns a promise which resolves with the new data to be cached
 * @returns {Promise<*>} promise that resolves with the cached data if it exists, or the newly fetched data if it was not in the cache.
 * @throws {Error} if theres issue on fetching new data or paramObject is not valid
 *
 * @example
 * //usage
 * const data = await getFromCache({
 *      key: 'test',
 *      onNewDataRequired: () => fetchSomeData()
 * });
 */
export async function getFromCache(paramObj) {
  return new Promise((resolve, reject) => {
    if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
      reject(new Error('Malformed or missing param object on function'));
    }
    const {key, onNewDataRequired} = paramObj;

    //id data stored return it
    if (cache[key]) {
      return resolve(cache[key]);
    }

    //if new data is required get it and update cache
    onNewDataRequired()
      .then((data) => {
        //record the new data
        cache[key] = data;

        //return new data
        resolve(data);
      })
      .catch((error) => {
        console.error('Error from fetching new data for cached data');
        reject(error);
      });
  });
}

/**
 * Delete one field and its data from cache
 *
 * @param {String} key key to find from cache
 * @returns {void} if key is not in cache give warning and move on
 */
export function clearCacheField(key) {
  if (!cache.hasOwnProperty(key)) {
    console.error(`No property ${key} in cache to clear`);
    return;
  }

  delete cache[key];
}

/**
 * Clear all cache
 * Normally just setting empty object would work for clearing but theres bunch of asynch functions so its a bit safer
 * and fine-grained controlled to handle individual cache entries. This cache isnt suppose to hold much data anyhow...
 */
export function clearCache() {
  //iterate through objects all keys
  //hasOwnPrety not needed as its safe to assume everything set to cache is by design and not inherited elsewhere
  for (const key of Object.keys(cache)) {
    delete cache[key];
  }
}
