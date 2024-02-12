import * as ui from './notificationUi.js';

//************************************************************************************** */
// Helper functions for notificationDataProcessor.js

/**
 * tests if notification data is acceptable format
 * @param {String|object} data
 * @returns {object} with valid and type fields
 */
export function isInputDataFormatGood(data){
    const type = getInputDataType(data);
    return {
        isValid: type !== 'invalid',
        type: type
    }
};

/**
 *
 * @param {String|object} data data inputted to the showNotification function
 * @returns {String} object type as a string
 */
export function getInputDataType(data){
    if (typeof data === 'string' || data instanceof String) {
        return 'string';
    }

    if (typeof data === 'object' && Object.keys(data).length !== 0 && Object.getPrototypeOf(data) === Object.prototype) {
        return 'object';
    }

    return 'invalid';
}

/**
 * Check is single datapoint is acceptable
 * @param {*} data uncertain data type
 * @param {String[]} validTypeArray different types of data, see typeof documentation, self build support for 'array' type
 * @throws {Error} if validtype array is not array
 * @returns {boolean} true if data type is found from array
 */
export function isDataValidType(data, validTypeArray){
    if(!Array.isArray(validTypeArray)){
        throw new Error('isDataValidType valid array parameter should be array of acceptable types');
    }
    const dataType = typeof data;
    //typeof lists arrays as types of objects so exaception handler here for easier support for array in validTypeArray
    return validTypeArray.includes(dataType) || (validTypeArray.includes('array') && isDataTypeOf(data, 'array'));
}

/**
 *
 * @param {*} data uncertain data
 * @param {String} expectedType what type should the data be ?
 * @returns {boolean} is the data expected type
 */
export function isDataTypeOf(data, expectedType){
    const dataType = typeof data;
    return expectedType === dataType || (dataType === 'object' && expectedType === 'array' && Array.isArray(data));
}

/**
 *Clears notification related keys from local storage using key name prefix
 */
export async function clearNotificationLocalStorage(){
    //see what key was used in close (notificationUiUtils.closeNotification)
    //TODO: instead having multiple places with keys requiring to be matched make some config ?
    const notificationKey = await getNotificationConfigKeyValue('localstorePrefixKey');
    if(!notificationKey){
        return;
    }
    for (const key of Object.keys(localStorage)) {
        if(key.includes(notificationKey)){
            localStorage.removeItem(key);
        }
    }
}

/**
 * Get value from config json with key
 * @param {String} key with configs key get value for it
 * @returns {*|undefined} whatever value the key holds in json or if key does not exist undefined
 * @throws {Error} if process fails
 */
export async function getNotificationConfigKeyValue(key){
    const path = '/../common/notifications/notificationConfig.json';
    return getConfigKeyValue(path, key)
}

/**
 * Get config data from config json
 * @param {String} path path to config file
 * @returns {object} get object from config file
 * @throws {Error} if theres issue with getting config
 */
async function getConfig(path){
    return fetch(path)
    .then(response => {
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
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
 * @param {String} path path to config file
 * @param {String} key fields key
 * @returns {*|undefined} returns value of the key or undefined if key not found
 */
async function getConfigKeyValue(path, key){
    return getConfig(path)
    .then(configData => {
        return configData?.[key];
    })
    .catch(error => {
        const err = `Failed to get value for ${key}`;
        console.log(er);
        console.log(error);
        throw new Error(err);
    });
}

/**
 * Get data required for getting and showing component (with ui data)
 * @param {String} componentStyle
 * @returns {object|undefined} with
 */
export async function getShowConfigData(componentStyle){
    if(!componentStyle){
        console.log('Missing param on getShowConfigData');
        return undefined;
    }

    //try to find resource config for style
    const resourceConfigs = await getNotificationConfigKeyValue('resourceConfigs');
    if(!resourceConfigs || !Array.isArray(resourceConfigs) || resourceConfigs.length <= 0){
        console.log('Resource configs missing from json');
        return undefined;
    }

    let resourceConfig = resourceConfigs.find(obj => obj.componentStyle === componentStyle);
    if(!resourceConfig){
        console.log(`Did not find resource configuration for ${componentStyle}`);
        return undefined;
    }

    //format return data and add correct show function
    if(componentStyle === 'banner'){
        return {
            inquiryData :resourceConfig,
            callUiToShow: ui.showBanner
        };
    }
    else if(componentStyle === 'banner_static'){
        return {
            inquiryData :resourceConfig,
            callUiToShow: ui.showBannerStatic
        };
    }
    else if(componentStyle === 'dialog'){
        return {
            inquiryData :resourceConfig,
            callUiToShow: ui.showDialog
        };
    }

    console.log('Did not get component inquiry data, no proper componentStyle found');
    return undefined;
}