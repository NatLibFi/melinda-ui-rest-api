
import {getServerNotifications} from '../rest.js';
import * as dataUtils from './notificationDataUtils.js';

//re-export so they are available on manager through processor
export {dataUtils};

/**
 * @param {String} clientName name of the client doing the request, if not correct shows notifications for all clients
 * @param {boolean} [debug=false] optional - debug flag for clearing local storage. Enables back all dismissed notifications. Mostly for internal usage
 * @returns {object} status object with 'blocking', 'notBlocking', 'hasBlocks' fields
 */
export async function getNotifications(clientName, debug = false){
    if(debug){
        //clears out melinda notifications not whole localstorage
        dataUtils.clearNotificationLocalStorage();
    }

    //if client is not set (or valid) assume we want notifications for all
    if(!clientName || !isClientValid(clientName)){
        clientName = 'all';
    }

    //do backend call and try filter them into different categories
    return getServerNotifications(clientName)
    .then(result => {
        if(!result || !result.notifications){
            throw new Error('No result or notifications from getServerNotifications');
        }

        return filterNotificationsByBlockState(result.notifications);
    })
    .catch(err => {
        console.log(err);
        throw new Error(err);
    });
}

/**
 * See if can fetch for client has support/has own notifications
 *
 * @param {String} clientName app/client name to check
 * @returns {boolean} was client given correct
 */
function isClientValid(clientName){
    //TODO: update clients fetching notifications
    const validClients = ['artikkelit', 'viewer', 'muuntaja', 'edit'];
    return validClients.includes(clientName.toLowerCase());
}

/**
 *
 * @param {object[]} notificationsDataArray data array with notifications data from server
 * @returns {object} status object with 'blocking', 'notBlocking', 'hasBlocks' fields
 */
async function filterNotificationsByBlockState(notificationsDataArray) {
        const storePrefixKey = await dataUtils.getNotificationConfigKeyValue('localstorePrefixKey');

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