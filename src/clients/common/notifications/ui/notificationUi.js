import * as uiUtils from '/../common/notifications/ui/notificationUiUtils.js';

//************************************************************************************** */
// Constructor/Show functions for notifications, no data changes, only shows and ui dependent work:

//************************************************************************************** */
// Constructor/Show functions:

/**
 * Banner
 *
 * @param {object} paramObj object delivery for function
 * @param {HTMLDivElement} paramObj.container container within document to hold shown notifications
 * @param {HTMLDivElement} paramObj.noteElement template html document for said notification style
 * @param {object} paramObj.dataForUi object for holding required data to show on ui
 * @param {String} paramObj.dataForUi.style how does the notification itself should look like info/error etc.
 * @param {String} paramObj.dataForUi.text visible text
 * @param {String} [paramObj.dataForUi.id] optional - id provided from server data, use for recording close action
 * @param {String} [paramObj.dataForUi.isDismissible=true] optional - can user close the notification
 * @param {object} [paramObj.dataForUi.linkButtonData] optional - object holding data for creating link button
 * @param {String} [paramObj.dataForUi.linkButtonData.text] optional - visible text
 * @param {String} [paramObj.dataForUi.linkButtonData.url] optional - visible text
 * @param {object} [paramObj.dataForUi.actionButtonData] optional - object holding data for creating action button
 * @param {object} [paramObj.dataForUi.actionButtonData.text] optional - visible text
 * @param {CallableFunction} [paramObj.dataForUi.actionButtonData.onClick] optional - action upon press
 */
export function showBanner(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {container, noteElement, dataForUi} = paramObj;
  const {style, text, linkButtonData, actionButtonData, id, isDismissible = true} = dataForUi;

  createBanner();
  addBanner();
  displayBannerWithAnimation();

  /**
     * using noteElement, style it and add to it
     * set data to ui
     */
  function createBanner() {

    const linkButton = uiUtils.createLinkButton({dataObject: linkButtonData});
    const actionButton = uiUtils.createActionButton({style, buttonData: actionButtonData, afterClick: () => {
      uiUtils.closeNotification({container, noteElement, notificationId: id});
    }});
    const linkId = 'notificationbanner-link';
    const acationId = 'notificationbanner-action';

    //if theres no close button and there is action button style actionbutton to right corner
    if (!isDismissible && actionButton) {
      noteElement.querySelector(`.${acationId}`).style.marginLeft = 'auto';
    }
    //if only link with text move link to right
    else if (!isDismissible && !actionButton && linkButton) {
      noteElement.querySelector(`.${linkId}`).style.marginLeft = 'auto';
    }

    uiUtils.setStylings({backgroundToStyleElement: noteElement, iconContainerElement: noteElement, style, iconId: 'notificationbanner-icon'});
    uiUtils.addText({noteElement, textId: 'notificationbanner-text', text});
    uiUtils.addButton({noteElement, buttonElement: linkButton, buttonContainerId: 'notificationbanner-link'});
    uiUtils.addButton({noteElement, buttonElement: actionButton, buttonContainerId: 'notificationbanner-action'});
    uiUtils.handleCloseButton({container, noteElement, closeButtonId: 'notificationbanner-close', canDismiss: isDismissible, notificationId: id});
  }

  /**
     * Add noteElement to container
     */
  function addBanner() {
    container.prepend(noteElement);
  }

  /**
     * Handles animation start/end and listeners for them,
     * call displayNotificationWithAnimation, you can provide override/update object to modify behaviour
     * if not given using default settings from the
     */
  function displayBannerWithAnimation() {
    uiUtils.displayNotificationWithAnimation({container, noteElement, notificationId: id});
  }
}

/**
 * Banner Static
 *
 * @param {object} paramObj object delivery for function
 * @param {HTMLDivElement} paramObj.container container within document to hold shown notifications
 * @param {HTMLDivElement} paramObj.noteElement template html document for said notification style
 * @param {object} paramObj.dataForUi object for holding required data to show on ui
 * @param {String} paramObj.dataForUi.style how does the notification itself should look like info/error etc.
 * @param {String} paramObj.dataForUi.text visible text
 * @param {object} [paramObj.dataForUi.linkButtonData] optional - object holding data for creating link button
 * @param {String} [paramObj.dataForUi.linkButtonData.text] optional - visible text
 * @param {String} [paramObj.dataForUi.linkButtonData.url] optional - visible text
 */
export function showBannerStatic(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {container, noteElement, dataForUi} = paramObj;
  const {style, text, linkButtonData} = dataForUi;

  createBannerStatic();
  addBannerStatic();

  /**
     * using noteElement, style it and add to it
     * set data to ui
     */
  function createBannerStatic() {
    //static banner has it background in separate element in the background
    const bgLevelElement = noteElement.querySelector(`.notificationbannerstatic-bg`);
    const linkButton = uiUtils.createLinkButton({dataObject: linkButtonData});

    uiUtils.setStylings({backgroundToStyleElement: bgLevelElement, iconContainerElement: noteElement, style, iconId: 'notificationbannerstatic-icon'});
    uiUtils.addText({noteElement, textId: 'notificationbannerstatic-text', text});
    uiUtils.addButton({noteElement, buttonElement: linkButton, buttonContainerId: 'notificationbannerstatic-link'});
  }

  /**
     * Add noteElement to container
     */
  function addBannerStatic() {
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
 * @param {object} paramObj object delivery for function
 * @param {HTMLDivElement} paramObj.container container that holds background and content container for notifications
 * @param {HTMLDivElement} paramObj.noteElement template html document for said notification style
 * @param {object} paramObj.dataForUi object for holding required data to show on ui
 * @param {String} paramObj.dataForUi.style how does the notification itself should look like info/error etc.
 * @param {String} paramObj.dataForUi.text visible text
 * @param {String} [paramObj.dataForUi.id] optional - identification for data object, used to mark notification to hidden upon hide
 * @param {String} [paramObj.dataForUi.title] optional - visible title text, most likely not given and setter gets defaults from this script
 * @param {String} [paramObj.dataForUi.isDismissible=true] optional - can user close the notification
 * @param {String} [paramObj.dataForUi.blocksInteraction=false] optional - use extra background to block interaction
 * @param {object} [paramObj.dataForUi.linkButtonData] optional - object holding data for creating link button
 * @param {String} [paramObj.dataForUi.linkButtonData.text] optional - visible text
 * @param {String} [paramObj.dataForUi.linkButtonData.url] optional - visible text
 * @param {object} [paramObj.dataForUi.actionButtonData] optional - object holding data for creating action button
 * @param {object} [paramObj.dataForUi.actionButtonData.text] optional - visible text
 * @param {CallableFunction} [paramObj.dataForUi.actionButtonData.onClick] optional - action upon press
 * @param {boolean} [paramObj.isStatic=true] optional - should the notificaiton remain on screen waiting for input or using animation go away
 */
export function showDialog(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {container, noteElement, dataForUi, isStatic = true} = paramObj;
  const {style, text, linkButtonData, actionButtonData, id, title, isDismissible = true, blocksInteraction = false} = dataForUi;

  const backgroundElement = container.querySelector(`#notificationDialogsBg`);
  const contentContainerElement = container.querySelector(`#notificationDialogs`);

  createDialog();
  addDialog();
  displayDialog();

  function createDialog() {
    const linkButton = uiUtils.createLinkButton({dataObject: linkButtonData});
    const actionButton = uiUtils.createActionButton({style, buttonData: actionButtonData, afterClick: () => {
      uiUtils.closeNotification({container: contentContainerElement, noteElement, notificationId: id, backgroundElement});
    }});

    uiUtils.setNotificationListBackground({backgroundElement, showBackground: blocksInteraction});
    uiUtils.setStylings({backgroundToStyleElement: noteElement, iconContainerElement: noteElement, style, iconId: 'notificationdialog-icon'});
    uiUtils.addTitle({noteElement, titleTextId: 'notificationdialog-title', style, title});
    uiUtils.addText({noteElement, textId: 'notificationdialog-text', text});
    uiUtils.addButton({noteElement, buttonElement: linkButton, buttonContainerId: 'notificationdialog-link'});
    uiUtils.addButton({noteElement, buttonElement: actionButton, buttonContainerId: 'notificationdialog-action'});
    uiUtils.handleCloseButton({container: contentContainerElement, noteElement, closeButtonId: 'notificationdialog-close', canDismiss: isDismissible, notificationId: id, backgroundElement});
  }
  function addDialog() {
    contentContainerElement.prepend(noteElement);
  }
  function displayDialog() {
    let animationUpdateObject;
    if (isStatic) {
      //override animation info with update object
      animationUpdateObject = {
        'classIdForAnimationElement': 'show',
        'listenAnimationToEnd': false
      };
    }
    //standard behaviour with auto close
    uiUtils.displayNotificationWithAnimation({container: contentContainerElement, noteElement, animationInfoObj: animationUpdateObject, backgroundElement, notificationId: id});
  }
}
