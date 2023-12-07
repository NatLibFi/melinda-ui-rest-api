
import {getServerNotifications} from './rest.js';

export function getNotifications(onSuccess){
    return getServerNotifications().then((result) => {
         
        onSuccess(pruneSeenNotifications(result.notifications));

        function pruneSeenNotifications(notifications){
            //TODO: check from local system what are seen and prune those if server does not check them out
            //include blocking notifications, maybe at the end of the list ?
            let showTheseNotifications = [];

            return notifications;
        }
    })
    .catch((err) => {
        console.log('Notifications failed to fetch');
        console.log(err);
    });
}