
import {getServerNotifications} from './rest.js';

export function getNotifications(onSuccess){
    return getServerNotifications().then((result) => {
         
        onSuccess(pruneSeenNotifications(result.notifications));

        function pruneSeenNotifications(notifications){
            //filter out any possibly user hidden notifications
            let notHiddenNotifications = notifications.filter(obj =>{return !obj._id || (obj._id && localStorage.getItem(`notification_${obj._id}`) === null)});
            //Filter out those that are nice to know and those that are blocking ones
            const notificationObject = {};
            notificationObject.blocking = notHiddenNotifications.filter(obj =>{return obj.preventOperation === true});
            notificationObject.notBlocking = notHiddenNotifications.filter(obj =>{return obj.preventOperation === false});
            notificationObject.hasBlocks = notificationObject.blocking.length > 0;
            return notificationObject;
        }
    })
    .catch((err) => {
        console.log('Notifications failed to fetch');
        console.log(err);
    });
}