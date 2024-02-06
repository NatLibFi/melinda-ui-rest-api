
import {showNotification} from '/common/ui-utils.js';
import {getNotifications} from '../common/notification.js';

//-----------------------------------------------------------------------------------------
// Initialize on page load
//-----------------------------------------------------------------------------------------

window.initialize = function () {
    console.log('Initializing');
};

window.onload = function() {
    console.log('On load');

    checkNotificationsAndDoLogin();

    function checkNotificationsAndDoLogin(){
        getNotifications('login')
        .then(notificationObject => {
        //generate appropriate ui items
        if(notificationObject.hasBlocks){
            showNotification(notificationObject.blocking);
            return;
        }

            showNotification(notificationObject.notBlocking);
        })
        .catch(err => {
            console.log('Notification fetch failed');
            showNotification({componentStyle: 'dialog', style: 'alert', text: 'Palvelin viestien haku epäonnistui', isDismissible: true});
        });
    }
};