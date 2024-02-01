
import {getServerNotifications} from './rest.js';

/**
 * @param {String} clientName name of the client doing the request, if not correct shows notifications for all clients
 * @returns {object} status object with 'blocking', 'notBlocking', 'hasBlocks' fields
 */
export async function getNotifications(clientName){

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
    return clientName.toLowerCase() === 'artikkelit' || clientName.toLowerCase() === 'viewer' || clientName.toLowerCase() === 'muuntaja';
}

/**
 * 
 * @param {object[]} notificationsDataArray data array with notifications data from server
 * @returns {object} status object with 'blocking', 'notBlocking', 'hasBlocks' fields
 */
function filterNotificationsByBlockState(notificationsDataArray) {
        //filter out any possibly user hidden notifications
        let notHiddenNotifications = notificationsDataArray.filter(obj => { return !obj.id || (obj.id && localStorage.getItem(`notification_${obj.id}`) === null); });

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