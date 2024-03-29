
import {getServerNotifications} from '/../common/rest.js';
import * as dataUtils from './notificationDataUtils.js';

//re-export so they are available on manager through processor
export {dataUtils};

/**
 * @param {object} paramObj object delivery for function
 * @param {String} paramObj.clientName name of the client doing the request, if not correct shows notifications for all clients
 * @returns {object} status object with 'blocking', 'notBlocking', 'hasBlocks' fields, HOWEVER if theres no data. Returns object with a field 'noNotifications' as true
 */
export async function getNotifications(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  let {clientName} = paramObj;

  if (await dataUtils.getDebugValue({key: 'clearNotificationLocalStorageOnLoad'})) {
    //clears out melinda notifications not whole localstorage
    dataUtils.clearNotificationLocalStorage();
  }

  //if client is not set (or valid) assume we want notifications for all
  clientName = await validateOverrideClientName({clientName});

  //do backend call and try filter them into different categories
  try {
    const result = await getServerNotifications(clientName);

    if (!result || !result.notifications) {
      throw new Error('No result or notifications from getServerNotifications');
    }

    //if items filter them
    if(result.notifications.length>0){
      return await filterNotificationsByBlockState({notificationsDataArray: result.notifications});
    }

    //if no items return field for cleaner check
    return {noNotifications: true};

  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

//************************************************************************************** */
// Helper functions

/**
 * See if can fetch for client has support/has own notifications
 *
 * @param {object} paramObj object delivery for function
 * @param {String} paramObj.clientName app/client name to check
 * @returns {boolean} was client given correct
 */
async function isClientValid(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {clientName} = paramObj;

  try {
    const validClients = await dataUtils.getNotificationConfigKeyValue({key: 'accepted_clients'});
    return validClients.includes(clientName.toLowerCase());
  } catch (error) {
    console.error('Client validity check failed. Using default.', error);
    return false;
  }
}

/**
 *
 * @param {object} paramObj object delivery for function
 * @param {object[]} paramObj.notificationsDataArray data array with notifications data from server
 * @returns {object} status object with 'blocking', 'notBlocking', 'hasBlocks' fields
 */
async function filterNotificationsByBlockState(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {notificationsDataArray} = paramObj;

  const storePrefixKey = await dataUtils.getNotificationConfigKeyValue({key: 'localstorePrefixKey'});

  //filter out any possibly user hidden notifications if storeprefix key is available
  //prefix key is for recording when user closes notification, if not available do not filter
  const notHiddenNotifications = storePrefixKey ? notificationsDataArray.filter(obj => {
    //if does not have id or has id and is not hidden by user
    const localStoreKey = storePrefixKey ? `${storePrefixKey}_${obj.id}` : '';
    return !obj.id || obj.id && storePrefixKey && localStorage.getItem(localStoreKey) === null;
  }) : notificationsDataArray;

  //Filter out those that are nice to know and those that are blocking ones
  const blockingArray = notHiddenNotifications.filter(obj => obj.blocksInteraction === true);
  const notBlockingArray = notHiddenNotifications.filter(obj => obj.blocksInteraction === false);
  const hasBlocks = blockingArray.length > 0;
  return {
    'blocking': blockingArray,
    'notBlocking': notBlockingArray,
    hasBlocks
  };
}

/**
 * Check if client name is acceptable, if not use generalized all
 *
 * @param {object} paramObj object delivery for function
 * @returns {String} either return same client name or override it with just all if its not valid
 */
async function validateOverrideClientName(paramObj){
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {clientName} = paramObj;
  const defaultOverrideName = 'all';

  if(!clientName){
    return defaultOverrideName;
  }

  const isValid = await isClientValid({clientName});

  return isValid ? clientName : defaultOverrideName;
}
