
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