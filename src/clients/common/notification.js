
import {getServerNotifications} from './rest.js';

export function getNotifications(client, onSuccess, onError = null){

    //if client is not set (or valid) assume we want notifications for all 
    if(!client || !isClientValid(client)){
        client = 'all';
    }

    return getServerNotifications(client).then((result) => { 

        onSuccess(pruneSeenNotifications(result.notifications));

        function pruneSeenNotifications(notifications){
            //filter out any possibly user hidden notifications
            let notHiddenNotifications = notifications.filter(obj =>{return !obj.id || (obj.id && localStorage.getItem(`notification_${obj.id}`) === null)});
            //Filter out those that are nice to know and those that are blocking ones
            const notificationObject = {};
            notificationObject.blocking = notHiddenNotifications.filter(obj =>{return obj.blocksInteraction === true});
            notificationObject.notBlocking = notHiddenNotifications.filter(obj =>{return obj.blocksInteraction === false});
            notificationObject.hasBlocks = notificationObject.blocking.length > 0;
            return notificationObject;
        }
    })
    .catch((err) => {
        console.log('Notifications failed to fetch');
        console.log(err);
        if(onError){
            onError();
        }
    });
}
function isClientValid(client){
    //TODO: update clients fetching notifications
    return client.toLowerCase() === 'artikkelit' || client.toLowerCase() === 'viewer' || client.toLowerCase() === 'muuntaja';
}