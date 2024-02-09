
import {showNotification, showServerNotifications} from '/common/ui-utils.js';

//-----------------------------------------------------------------------------------------
// Initialize on page load
//-----------------------------------------------------------------------------------------

window.initialize = function () {
    console.log('Initializing');
};

window.onload = function() {
    console.log('On load');

    showServerNotifications('login');
};