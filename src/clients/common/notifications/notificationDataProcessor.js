
import {getServerNotifications} from '../rest.js';
import * as dataUtils from './notificationDataUtils.js';

//re-export so they are available on manager through processor
export {dataUtils};

/**
 * @param {object} paramObj object delivery for function
 * @param {String} paramObj.clientName name of the client doing the request, if not correct shows notifications for all clients
 * @param {boolean} [paramObj.debug=false] optional - debug flag for clearing local storage. Enables back all dismissed notifications. Mostly for internal usage
 * @returns {object} status object with 'blocking', 'notBlocking', 'hasBlocks' fields
 */
export async function getNotifications(paramObj){
    if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <=  0){
        throw new Error('Malformed or missing param object on function');
    }
    const {clientName, debug = false} = paramObj;

    if(debug){
        //clears out melinda notifications not whole localstorage
        dataUtils.clearNotificationLocalStorage();
    }

    //if client is not set (or valid) assume we want notifications for all
    if(!clientName || !isClientValid({clientName: clientName})){
        clientName = 'all';
    }

    //do backend call and try filter them into different categories
    return getServerNotifications(clientName)
    .then(result => {
        if(!result || !result.notifications){
            throw new Error('No result or notifications from getServerNotifications');
        }

        return filterNotificationsByBlockState({notificationsDataArray: result.notifications});
    })
    .catch(err => {
        console.log(err);
        throw new Error(err);
    });
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
function isClientValid(paramObj){
    if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <=  0){
        throw new Error('Malformed or missing param object on function');
    }
    const {clientName} = paramObj;

    //TODO: update clients fetching notifications
    const validClients = ['artikkelit', 'viewer', 'muuntaja', 'edit'];
    return validClients.includes(clientName.toLowerCase());
}

/**
 *
 * @param {object} paramObj object delivery for function
 * @param {object[]} paramObj.notificationsDataArray data array with notifications data from server
 * @returns {object} status object with 'blocking', 'notBlocking', 'hasBlocks' fields
 */
async function filterNotificationsByBlockState(paramObj) {
    if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <=  0){
        throw new Error('Malformed or missing param object on function');
    }
    const {notificationsDataArray} = paramObj;

    const storePrefixKey = await dataUtils.getNotificationConfigKeyValue({key: 'localstorePrefixKey'});

    //filter out any possibly user hidden notifications
    let notHiddenNotifications = notificationsDataArray.filter(obj => {
        const localStoreKey = storePrefixKey ? `${storePrefixKey}_${obj.id}` : '';
        return !obj.id || (obj.id && storePrefixKey && localStorage.getItem(localStoreKey) === null);
    });

    //Filter out those that are nice to know and those that are blocking ones
    const blockingArray = notHiddenNotifications.filter(obj => { return obj.blocksInteraction === true; });
    const notBlockingArray = notHiddenNotifications.filter(obj => { return obj.blocksInteraction === false; });
    const hasBlocks = blockingArray.length > 0;
    return {
        'blocking': blockingArray,
        'notBlocking': notBlockingArray,
        'hasBlocks': hasBlocks
    };
}