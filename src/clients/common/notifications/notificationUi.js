import * as uiUtils from './notificationUiUtils.js';

//************************************************************************************** */
// Constructor/Show functions for notifications, no data changes, only shows and ui dependent work:

//************************************************************************************** */
// Constructor/Show functions:

/**
 * Banner
 *
 * @param {HTMLDivElement} container container within document to hold shown notifications
 * @param {HTMLDivElement} noteElement template html document for said notification style
 * @param {object} dataForUi object for holding required data to show on ui
 * @param {String} dataForUi.style how does the notification itself should look like info/error etc.
 * @param {String} dataForUi.text visible text
 * @param {String} dataForUi.closePrefix prefix for closing, used to save to local storage, comes from config, used only if id present
 * @param {String} [dataForUi.id] optional - id provided from server data, use for recording close action
 * @param {String} [dataForUi.isDismissible=true] optional - can user close the notification
 * @param {object} [dataForUi.linkButtonData] optional - object holding data for creating link button
 * @param {String} [dataForUi.linkButtonData.text] optional - visible text
 * @param {String} [dataForUi.linkButtonData.url] optional - visible text
 * @param {object} [dataForUi.actionButtonData] optional - object holding data for creating action button
 * @param {object} [dataForUi.actionButtonData.text] optional - visible text
 * @param {CallableFunction} [dataForUi.actionButtonData.onClick] optional - action upon press
 */
export function showBanner(container, noteElement, dataForUi){
    const {style, text, linkButtonData, actionButtonData, id, closePrefix, isDismissible=true} = dataForUi;

    createBanner();
    addBanner();
    displayBannerWithAnimation();

    /**
     * using noteElement, style it and add to it
     * set data to ui
     */
    function createBanner(){
        uiUtils.setStylings(noteElement, noteElement, style, 'notificationbanner-icon');
        uiUtils.addText(noteElement, 'notificationbanner-text', text);
        const linkButton = uiUtils.createLinkButton(linkButtonData);
        const actionButton = uiUtils.createActionButton(style, actionButtonData, ()=>{closeNotification(container, noteElement, id);});
        const linkId = 'notificationbanner-link';
        const acationId = 'notificationbanner-action';
        //if theres no close button and there is action button style actionbutton to right corner
        if(!isDismissible && actionButton){
            noteElement.querySelector(`.${acationId}`).style.marginLeft = 'auto';
        }
        //if only link with text move link to right
        else if(!isDismissible && !actionButton && linkButton){
            noteElement.querySelector(`.${linkId}`).style.marginLeft = 'auto';
        }
        uiUtils.addButton(noteElement, linkButton, 'notificationbanner-link');
        uiUtils.addButton(noteElement, actionButton, 'notificationbanner-action');
        uiUtils.handleCloseButton(container, noteElement, 'notificationbanner-close', isDismissible, id, closePrefix);
    }
    /**
     * Add noteElement to container
     */
    function addBanner(){
        container.prepend(noteElement);
    }
    /**
     * Handles animation start/end and listeners for them,
     * call displayNotificationWithAnimation, you can provide override/update object to modify behaviour
     * if not given using default settings from the
     */
    function displayBannerWithAnimation(){
        uiUtils.displayNotificationWithAnimation(container, noteElement, undefined, undefined, id, closePrefix);
    }
}

/**
 * Banner Static
 *
 * @param {HTMLDivElement} container container within document to hold shown notifications
 * @param {HTMLDivElement} noteElement template html document for said notification style
 * @param {object} dataForUi object for holding required data to show on ui
 * @param {String} dataForUi.style how does the notification itself should look like info/error etc.
 * @param {String} dataForUi.text visible text
 * @param {object} [dataForUi.linkButtonData] optional - object holding data for creating link button
 * @param {String} [dataForUi.linkButtonData.text] optional - visible text
 * @param {String} [dataForUi.linkButtonData.url] optional - visible text
 */

export function showBannerStatic(container, noteElement, dataForUi){
    const {style, text, linkButtonData} = dataForUi;

    createBannerStatic();
    addBannerStatic();

    /**
     * using noteElement, style it and add to it
     * set data to ui
     */
    function createBannerStatic(){
        //static banner has it background in separate element in the background
        const bgLevelElement = noteElement.querySelector(`.notificationbannerstatic-bg`);
        uiUtils.setStylings(bgLevelElement, noteElement, style, 'notificationbannerstatic-icon')
        uiUtils.addText(noteElement, 'notificationbannerstatic-text', text);
        const linkButton = uiUtils.createLinkButton(linkButtonData);
        uiUtils.addButton(noteElement, linkButton, 'notificationbannerstatic-link');
    }
    /**
     * Add noteElement to container
     */
    function addBannerStatic(){
        //TODO: currently can have multiple static banners but should we ?
        //hackish solution would be just clear the old ones before setting so last one to set would be visible...
        //for now just add all and let data handle how many are active at the same time
        container.prepend(noteElement);
    }
}
/**
 * Dialog
 *
 * Dialog has a bit different setup where content is separated to background and content container
 * This div structure should be visible from within each apps that supports notification html
 *
 * @param {HTMLDivElement} container container that holds background and content container for notifications
 * @param {HTMLDivElement} noteElement template html document for said notification style
 * @param {object} dataForUi object for holding required data to show on ui
 * @param {String} dataForUi.style how does the notification itself should look like info/error etc.
 * @param {String} dataForUi.text visible text
 * @param {String} dataForUi.closePrefix prefix for closing, used to save to local storage, comes from config, used only if id present
 * @param {String} [dataForUi.id] optional - identification for data object, used to mark notification to hidden upon hide
 * @param {String} [dataForUi.title] optional - visible title text, most likely not given and setter gets defaults from this script
 * @param {String} [dataForUi.isDismissible=true] optional - can user close the notification
 * @param {String} [dataForUi.blocksInteraction=false] optional - use extra background to block interaction
 * @param {object} [dataForUi.linkButtonData] optional - object holding data for creating link button
 * @param {String} [dataForUi.linkButtonData.text] optional - visible text
 * @param {String} [dataForUi.linkButtonData.url] optional - visible text
 * @param {object} [dataForUi.actionButtonData] optional - object holding data for creating action button
 * @param {object} [dataForUi.actionButtonData.text] optional - visible text
 * @param {CallableFunction} [dataForUi.actionButtonData.onClick] optional - action upon press
 * @param {boolean} [isStatic=true] optional - should the notificaiton remain on screen waiting for input or using animation go away
 */
export function showDialog(container, noteElement, dataForUi, isStatic=true){
    const {style, text, linkButtonData, actionButtonData, closePrefix, id, title, isDismissible=true, blocksInteraction=false} = dataForUi;
    const backgroundElement = container.querySelector(`#notificationDialogsBg`);
    const contentContainerElement = container.querySelector(`#notificationDialogs`);

    uiUtils.setNotificationListBackground(backgroundElement, blocksInteraction);
    createDialog();
    addDialog();
    displayDialog();

    function createDialog(){
        uiUtils.setStylings(noteElement, noteElement, style, 'notificationdialog-icon');
        uiUtils.addTitle(noteElement, 'notificationdialog-title', style, title);
        uiUtils.addText(noteElement, 'notificationdialog-text', text);
        const linkButton = uiUtils.createLinkButton(linkButtonData);
        const actionButton = uiUtils.createActionButton(style, actionButtonData, ()=>{closeNotification(contentContainerElement, noteElement, id, backgroundElement);});
        uiUtils.addButton(noteElement, linkButton, 'notificationdialog-link');
        uiUtils.addButton(noteElement, actionButton, 'notificationdialog-action');
        uiUtils.handleCloseButton(contentContainerElement, noteElement, 'notificationdialog-close', isDismissible, id, closePrefix, true, backgroundElement);
    }
    function addDialog(){
        contentContainerElement.prepend(noteElement);
    }
    function displayDialog(){
        let animationUpdateObject = undefined;
        if(isStatic){
            //override animation info with update object
            animationUpdateObject = {
                'classIdForAnimationElement': 'show',
                'listenAnimationToEnd': false,
            };
        }
        //standard behaviour with auto close
        uiUtils.displayNotificationWithAnimation(contentContainerElement, noteElement, animationUpdateObject, backgroundElement, id, closePrefix);
    }
}