import * as ui from '/../common/notifications/ui/notificationUi.js';
import {getFromCache} from '/../common/cacheService.js';

//************************************************************************************** */
// Helper functions for notificationDataProcessor.js


/**
 * tests if notification data is acceptable format
 *
 * @param {object} paramObj object delivery for function
 * @param {String|object} paramObj.data
 * @returns {object} with valid and type fields
 */
export function isInputDataFormatGood(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {data} = paramObj;

  const type = getInputDataType({data});
  return {
    isValid: type !== 'invalid',
    type
  };
}

/**
 * Check is single datapoint is acceptable
 *
 * @param {object} paramObj object delivery for function
 * @param {*} paramObj.data uncertain data type
 * @param {String[]} paramObj.validTypeArray different types of data, see typeof documentation, self build support for 'array' type
 * @throws {Error} if validtype array is not array
 * @returns {boolean} true if data type is found from array
 */
export function isDataValidType(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {data, validTypeArray} = paramObj;

  if (!Array.isArray(validTypeArray)) {
    throw new Error('isDataValidType valid array parameter should be array of acceptable types');
  }
  const dataType = typeof data;
  //typeof lists arrays as types of objects so exaception handler here for easier support for array in validTypeArray
  return validTypeArray.includes(dataType) || validTypeArray.includes('array') && isDataTypeOf({data, expectedType: 'array'});
}

/**
 *Clears notification related keys from local storage using key name prefix
 */
export async function clearNotificationLocalStorage() {
  //see what key was used in close (notificationUiUtils.closeNotification)
  //TODO: instead having multiple places with keys requiring to be matched make some config ?
  const notificationKey = await getNotificationConfigKeyValue({key: 'localstorePrefixKey'});
  if (!notificationKey) {
    console.warn('Key missing on clearNotificationLocalStorage');
    return;
  }
  for (const key of Object.keys(localStorage)) {
    if (key.includes(notificationKey)) {
      localStorage.removeItem(key);
    }
  }
}

/**
 * Get value from config json with key
 *
 * @param {object} paramObj object delivery for function
 * @param {String} paramObj.key with configs key get value for it
 * @returns {*|undefined} whatever value the key holds in json or if key does not exist undefined
 * @throws {Error} if process fails
 */
export async function getNotificationConfigKeyValue(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {key} = paramObj;

  const path = '/../common/notifications/notificationConfig.json';
  return getConfigKeyValue({path, key, cacheKeyConfig: 'notificationConfig'});
}

/**
 * Get data required for getting and showing component (with ui data)
 *
 * @param {object} paramObj object delivery for function
 * @param {String} paramObj.componentStyle
 * @returns {object|undefined} with
 */
export async function getShowConfigData(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {componentStyle} = paramObj;

  if (!componentStyle) {
    console.log('Missing param on getShowConfigData');
    return undefined;
  }

  //try to find resource config for style
  const resourceConfigs = await getNotificationConfigKeyValue({key: 'resourceConfigs'});
  if (!resourceConfigs || !Array.isArray(resourceConfigs) || resourceConfigs.length <= 0) {
    console.log('Resource configs missing from json');
    return undefined;
  }

  const resourceConfig = resourceConfigs.find(obj => obj.componentStyle === componentStyle);
  if (!resourceConfig) {
    console.log(`Did not find resource configuration for ${componentStyle}`);
    return undefined;
  }

  //format return data and add correct show function
  if (componentStyle === 'banner') {
    return {
      inquiryData: resourceConfig,
      callUiToShow: ui.showBanner
    };
  } else if (componentStyle === 'banner_static') {
    return {
      inquiryData: resourceConfig,
      callUiToShow: ui.showBannerStatic
    };
  } else if (componentStyle === 'dialog') {
    return {
      inquiryData: resourceConfig,
      callUiToShow: ui.showDialog
    };
  }

  console.log('Did not get component inquiry data, no proper componentStyle found');
  return undefined;
}

//************************************************************************************** */
// Helper function

/**
 * Get config data from config json or cache
 *
 * @param {object} paramObj object delivery for function
 * @param {String} paramObj.path path to config file
 * @param {String} paramObj.cacheKey key for storing config data in cache
 * @returns {object} get object from config file
 * @throws {Error} if theres issue with getting config
 */
async function getConfig(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {path, cacheKey} = paramObj;

  return getFromCache({
    key: cacheKey,
    onNewDataRequired: () => fetch(path).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
  })
    .catch(error => {
      const err = 'Could not get config for notifications';
      console.log(err);
      console.log(error);
      throw new Error(err);
    });
}

/**
 * Get field value from config file
 *
 * @param {object} paramObj object delivery for function
 * @param {String} paramObj.path path to config file
 * @param {String} paramObj.key fields key
 * @param {String} paramObj.cacheKeyConfig key for cache storing config data
 * @returns {*|undefined} returns value of the key or undefined if key not found
 */
async function getConfigKeyValue(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {path, key, cacheKeyConfig} = paramObj;

  return getConfig({path, cacheKey: cacheKeyConfig})
    .then(configData => configData?.[key])
    .catch(error => {
      const err = `Failed to get value for ${key}`;
      console.log(err);
      console.log(error);
      throw new Error(err);
    });
}

/**
 *
 * @param {object} paramObj object delivery for function
 * @param {*} paramObj.data uncertain data
 * @param {String} paramObj.expectedType what type should the data be ?
 * @returns {boolean} is the data expected type
 */
function isDataTypeOf(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {data, expectedType} = paramObj;

  const dataType = typeof data;
  return expectedType === dataType || dataType === 'object' && expectedType === 'array' && Array.isArray(data);
}

/**
 *
 * @param {object} paramObj object delivery for function
 * @param {String|object} paramObj.data data inputted to the showNotification function
 * @returns {String} object type as a string
 */
function getInputDataType(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {data} = paramObj;

  if (typeof data === 'string' || data instanceof String) {
    return 'string';
  }

  if (typeof data === 'object' && Object.keys(data).length !== 0 && Object.getPrototypeOf(data) === Object.prototype) {
    return 'object';
  }

  return 'invalid';
}