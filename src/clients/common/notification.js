
import {getServerNotifications} from './rest.js';

export function getNotifications(onSuccess){
    return getServerNotifications().then((result) => {
         
        onSuccess(pruneSeenNotifications(result.notifications));

        function pruneSeenNotifications(notifications){
            //TODO: check from local system what are seen and prune those if server does not check them out
            //include blocking notifications, maybe at the end of the list ?
            let showTheseNotifications = [];

            //Filter out those that are nice to know and those that are blocking ones
            const notificationObject = {};
            notificationObject.blocking = notifications.filter(obj =>{return obj.preventOperation === true});
            notificationObject.notBlocking = notifications.filter(obj =>{return obj.preventOperation === false});
            notificationObject.all = notifications;
            notificationObject.hasBlocks = notificationObject.blocking.length > 0;

            return notificationObject;
        }
    })
    .catch((err) => {
        console.log('Notifications failed to fetch');
        console.log(err);
    });
}