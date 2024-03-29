import {getNotifications, dataUtils} from '/../common/notifications/data/notificationDataProcessor.js';
import * as resouceUtils from '/../common/notifications/ui/notificationResourceUtils.js';
import * as ui from '/../common/notifications/ui/notificationUi.js';

//Notification features
/**
 * Different notifications:
 *
 * banner:
 *      can:
 *          - can animate
 *          - can remain on screen
 *          - can be dismissed manually
 *          - autoremoves itself
 *          - have linkbutton
 *          - have action button
 *      does:
 *          - animates (in and out)
 *          - be dismissed manually
 *          - autoremoves itself
 *          - if data sets linkbutton
 *          - if data sets action button (and automatically closes notification after action)
 *          - autoremove on close and animation out
 * banner_static:
 *      does:
 *          - statically visible
 *          - supports multiple static banners, if theres data for it, but you might want to make sure theres only data for one
 *          - if data sets linkbutton
 * dialog:
 *      can:
 *          - can animate
 *          - can remain on screen
 *          - can have interface blocking background
 *          - can be dismissed
 *          - can autoremove itself
 *          - have linkbutton
 *          - have linkbutton
 *      does:
 *          - animates (in)
 *          - if data uses blocking background
 *          - if data sets linkbutton
 *          - if data sets action button (and automatically closes notification after action)
 *          - autoremove on close
 *
 *
 * Notification message styles:
 *    - alert
 *    - error
 *    - info
 *    - success
 *
 */

/**
 * Wrapper function for showing server notifications keeping other scripts a bit cleaner
 * Loads notifications from server and in certain cases triggers functions,
 *
 * @param {object} paramObj object delivery for function
 * @param {CallableFunction} paramObj.clientName client/page that requests server notifications
 * @param {CallableFunction} [paramObj.onSuccess] optional - triggers when loaded notification without blocks
 * @param {CallableFunction} [paramObj.onFailure] optional - triggers when error is thrown in process of loading or showing notification
 * @param {CallableFunction} [paramObj.onBlock] optional - triggers when loaded notifications have blocks, most likely cases where there are outages
 */
export async function showServerNotifications(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {clientName, onSuccess, onFailure, onBlock} = paramObj;

  try {
    const notificationObject = await getNotifications({clientName: clientName});
    //if no items to show exit quick, consider this a success, errors should have triggered by now
    if(notificationObject.noNotifications){
      console.log('No notifications to show.');
      if(onSuccess){
        onSuccess();
      }
      return;
    }

    //generate appropriate ui items
    //blocking ones have own status
    if (notificationObject.hasBlocks) {
      await showNotification(notificationObject.blocking);

      if (onBlock) {
        onBlock();
      }
      return;
    }

    //normal notifications
    await showNotification(notificationObject.notBlocking);

    if (onSuccess) {
      onSuccess();
      return;
    }
  } catch (error) {
    console.error('Notification fetch or show failed');
    console.error(error);

    //failure/error could also indicate showing error so try to show error message but try catch it?
    try {
      await showNotification({componentStyle: 'dialog', style: 'alert', text: 'Palvelin viestien haku epäonnistui', isDismissible: true});
    } catch (error) {
      console.error('Issue on showing failure notificaiton');
      console.error(error);
    }

    if (onFailure) {
      onFailure();
      return;
    }

    console.error('On failure parameter missing');
  }
}

/**
 * Show visible notification with single data or array of data
 * - in array each data object is validated so it could be either object or string
 * - if not array data can be object or string
 * - any string based data gets default values in data formatting before show
 *
 * @param {object|object[]|String|String[]} notificationData
 *
 * @example
 * //some example cases
 * //In general you want to either pass string or object (or array with said data)
 * //String with simple text
 * //With object you want to set at least componentStyle, style and text
 *
 * //Fast easy string, defaults to info banner with animation out and close button, can stack
   showNotification('This is a test info');
 *
 * //Using object. Dialog with alert style. Remains on screen and can be closed. Does not block UI interaction, can stack
   showNotification({componentStyle: 'dialog', style:'alert', text: 'This is a bit more space needing information'});
 *
 * //Mass data handling, for example data array from server, array of objects
   showNotification(dataArrayFromServer);
 *
 * //Can even throw multiple quick ones if so needed
   showNotification(['One Test', 'Second test']);
 *
 * //Static reminder on top of the page. Supports multiple ones but in normal usercase we might want to have just one, use it sparingly
   showNotification({componentStyle: 'banner_static', style: 'info', text: 'Did you know that...'});
 *
 * //you can throw a dialog that blocks user from interacting with the UI, though this should be used sparingly and kept in mind how user can interact with dialogs
 * //IF user closes the last blocking dialog the block layer is removed
 * //Blocking dialogs take priority so try to bunddle blocking dialogs if you need to throw multiple
 * //this is a simple dialog with blocking layer, user MUST at least close it to acknowledge its existance
   showNotification({componentStyle: 'dialog', style: 'alert', text: 'For your immediate attention!', blocksInteraction: true});
 *
 * //this is informative blocking dialog that cant be closed itself.
 * //Action button here makes sure user can go back to some view so they are not stuck, unless you want it, then remove actionButtonData
   showNotification({
    componentStyle: 'dialog',
    style: 'info',
    text: 'This view is not usable...',
    blocksInteraction: true,
    isDismissible: false,
    actionButtonData:{
      text:'Go To Main Page',
      onClick:()=>{
        //code here
      }}
   });
 *
 * //action and link buttons are enabled in banner and dialog componentStyle:s
 * //they work independently, meaning they can be enabled at the same time (tho in banner if theres no close button action button moves right, and if thres no action button or close the link button moves to right - to save space)
 * //heres basic example usage (note that current show functions iteration uses after action to close notification, after your onClick has been dealt with)
 * //show banner with close button, link and action button
   showNotification({
        componentStyle: 'banner', style: 'info', text:'Simple test',
        linkButtonData:{text: 'go to search', url: 'https://www.google.com'},
        actionButtonData:{text:'Press Here To Print And Close', onClick:()=>{console.log('Hello world');}},
   });
   //show banner with link and action button
   showNotification({
        componentStyle: 'banner', style: 'info', text:'Simple test', isDismissible: false,
        linkButtonData:{text: 'go to search', url: 'https://www.google.com'},
        actionButtonData:{text:'Press Here To Print And Close', onClick:()=>{console.log('Hello world');}},
   });
 * //show banner with link button
   showNotification({
        componentStyle: 'banner', style: 'info', text:'Simple test', isDismissible: false,
        linkButtonData:{text: 'go to search', url: 'https://www.google.com'},
   });
 * //show banner with action button
   showNotification({
        componentStyle: 'banner', style: 'info', text:'Simple test', isDismissible: false,
        actionButtonData:{text:'Press Here To Print And Close', onClick:()=>{console.log('Hello world');}},
   });
 */
export async function showNotification(notificationData) {
  if (!notificationData) {
    const errorMessage = 'No data for showNotification';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  //if not valid type of data fail fast
  if (!dataUtils.isDataValidType({data: notificationData, validTypeArray: ['array', 'object', 'string']})) {
    const errorMessage = 'Data for showNotification not correct type';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  //if data is in array show individual items
  if (Array.isArray(notificationData)) {
    for (const obj of notificationData) {
      if (dataUtils.isDataValidType({data: notificationData, validTypeArray: ['object', 'string']})) {
        await setupUiData(obj);
      }
    }
    return;
  }

  //object or string style data passed along, data formatted accordingly later
  await setupUiData(notificationData);
}


//************************************************************************************** */
// Helper functions

/**
 * Script info
 *
 * Data checks and formats from passed data "uniform" object data thats hanlded later with same naming style
 *
 * This is a catch all function to take in either user thrown notification data or server formed data
 * If id field is present expect it to be from server so convert the data to format we want here
 *
 * Theres a bunch of fields that are optional andor are present in different name in server data than set by hand, update here in object formation
 *
 * @param {object} data dataobject either from server or set by hand
 * @param {String} data.componentStyle server data, also supply self, in what format do we show the notification banner/dialog ... ? default to banner if not set
 * @param {String} data.style what kind of info notification show inffo/error etc. ?
 * @param {String} data.text visible text to show
 * @param {String} [data.title] optional - visible title text, used for dialog, if not given sets one
 * @param {String} [data.id] optional - identification for data object, used for hiding/showing server message
 * @param {String} [data.messageStyle] optional - server data, will be automatically moved to style field
 * @param {String} [data.messageText] optional - server data, will be automatically moved to text field
 * @param {String} [data.isDismissible] optional - server data, also supply self, used in dialog, can user close notification, if not given defaults to true
 * @param {String} [data.blocksInteraction] optional - server data, also supply self, used in dialog, does notification have overlay behind it that blocks UI usage
 * @param {object} [data.linkButtonData] optional - object for holding data for creating link button, overriden by url if present
 * @param {object} [data.linkButtonData.text] optional - visible text for link button
 * @param {object} [data.linkButtonData.url] optional - url to open
 * @param {Element} [data.url] optional - can be server data, url to open with link button with, can be used for quick setting linkButton with default value for visible text
 * @param {object} [data.actionButtonData] optional - data object for setting action button
 * @param {String} [data.actionButtonData.text] optional - visible text
 * @param {CallableFunction} [data.actionButtonData.onClick] optional - action upon click
 */
async function setupUiData(data) {

  /**
   * Check data validity (is it in ok form)
   * String and Object based data have separation, string has default values while object expects to use provided data (some data optional, check in actual use case)
   */

  //test if data is in acceptable format, additional checks not only surface typeof
  const dataStatusObj = dataUtils.isInputDataFormatGood({data});
  if (!dataStatusObj.isValid) {
    const dataTypeValidError = 'showNotification data type is not valid';
    console.error(dataTypeValidError);
    throw new Error(dataTypeValidError);
  }

  //if data a string, use quick default values
  if (dataStatusObj.type === 'string') {
    //data is string so using default values and setting data as text
    await prepareAndShowUi({
      componentStyle: 'banner',
      style: 'info',
      text: data
    });
    return;
  }

  /**
   * if data is object, as its expected to be:
   *
   * Format data for later usage, makes sure later we can expect same naming schema
   * some optional data can be undefined if data hand set (like id)
   * some optional data is for certain component style notification, (ie. isDismissible)
   * some optional data is provided by server data but in another field so move it into corrrect format (ie. messageText to text)
   */
  const isDataFromServer = data.id !== undefined;
  const style = isDataFromServer ? data.messageStyle : data.style;
  const linkButtonCreationData = data.url ? {text: 'Lue Lisää Täältä', url: data.url} : data.linkButtonData;
  await prepareAndShowUi({
    id: data.id,
    componentStyle: data.componentStyle ?? 'banner',
    title: data.title,
    style,
    text: isDataFromServer ? data.messageText : data.text,
    linkButtonData: linkButtonCreationData,
    actionButtonData: data.actionButtonData,
    isDismissible: data.isDismissible,
    blocksInteraction: data.blocksInteraction
  });
}

/**
 * Using componentStyle get correct config data for getting correct components and pass all that for showing correct ui
 *
 * @param {object} data all notificaiton relevant data
 */
async function prepareAndShowUi(data) {

  //get config with resource info and show function
  try {
    const showConfig = await dataUtils.getShowConfigData({componentStyle: data.componentStyle});
    const {container, noteElement} = await resouceUtils.getRequiredComponentData({componentInquiryData: showConfig});

    if(!showConfig.showFunctionName || typeof ui[showConfig.showFunctionName] !== 'function'){
      throw new Error(`Could not call ${data.componentStyle} show function. Attempted to find function named ${showConfig.showFunctionName}. Please see config or getShowConfigData`);
    }

    ui[showConfig.showFunctionName]({container, noteElement, dataForUi: data});

  } catch (error) {
    throw new Error(error);
  }
}

