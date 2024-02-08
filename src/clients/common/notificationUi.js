
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
 *      does:
 *          - animates (in and out)
 *          - be dismissed manually
 *          - autoremoves itself
 *          - if data sets linkbutton
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
 *      does:
 *          - animates (in)
 *          - if data uses blocking background
 *          - if data sets linkbutton
 *          - autoremove on close
 */

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
 *
 * //Fast easy string, defaults to info banner with animation out and close button, can stack
 * showNotification('This is a test info');
 *
 * //Using object. Dialog with alert style. Remains on screen and can be closed. Does not block UI interaction, can stack
 * showNotification({componentStyle: 'dialog', style:'alert', text: 'This is a bit more space needing information'});
 *
 * //Mass data handling, for example data array from server, array of objects
 * showNotification(dataArrayFromServer);
 *
 * //Can even throw multiple quick ones if so needed
 * showNotification(['One Test', 'Second test']);
 *
 * //Static reminder on top of the page. Supports multiple ones but in normal usercase we might want to have just one, use it sparingly
 * showNotification({componentStyle: 'banner_static', style: 'info', text: 'Did you know that...'});
 */
export function showNotification(notificationData){
    if(!notificationData){
        console.log('No data for showNotification');
        return;
    }

    //if not valid type of data fail fast
    if(!isDataValidType(notificationData, ['array', 'object', 'string'])){
        console.log('Data for showNotification not correct type');
        return;
    }

    //if data is in array show individual items
    if(Array.isArray(notificationData)){
        for (const obj of notificationData) {
            if(isDataValidType(notificationData, ['object', 'string'])){
                showSingleNotification(obj);
            }
        }
        return;
    }

    //object or string style data passed along, data formatted accordingly later
    showSingleNotification(notificationData);
}

/**
 * Script info
 *
 * This is a catch all function to take in either user thrown notification data or server formed data
 * If id field is present expect it to be from server so convert the data to format we want here
 *
 * Theres a bunch of fields that are optional andor are present in different name in server data than set by hand
 *
 * If unsure and you are throwing one notification by hand use only required ones (componentStyle, style, text)
 * or for quick info usage just pass your message as string instead of object, then system defaults to:
 * {
 *  componentStyle: banner
 *  style: info
 *  text: you_passed_string_here
 * }
 *
 * General logic structure:
 * > check data type generally and defaults
 *   > check style and formulate style dependent data, get container and elment/document, add to other data
 *      > show/create style spesific notification
 *          > set element stylings, add functionalities and missing elements,
 *          > add to notification to container
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
 */
function showSingleNotification(data){
    /**
     * Check data validity (is it in ok form)
     * String and Object based data have separation, string has default values while object expects to use provided data (some data optional, check in actual use case)
     */

    //test if data is in acceptable format, additional checks not only surface typeof
    const dataStatusObj = isInputDataFormatGood(data);
    if(!dataStatusObj.isValid){
        console.log('showNotification data type is not valid');
        return;
    }

    //if data a string, use quick default values
    if(dataStatusObj.type === 'string'){
        //data is string so using default values and setting data as text
        showCorrectStyleNotification({
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
    const linkButtonCreationData = data.url ? {text:'Lue Lisää Täältä', url: data.url} : data.linkButtonData;
    showCorrectStyleNotification({
        id: data.id,
        componentStyle: data.componentStyle ?? 'banner',
        title: data.title,
        style: isDataFromServer ?  data.messageStyle : data.style,
        text: isDataFromServer ?  data.messageText : data.text,
        linkButton: linkButtonCreationData ? createLinkButton(linkButtonCreationData) : undefined,
        isDismissible: data.isDismissible,
        blocksInteraction: data.blocksInteraction
    });
}

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
 * @param {String} [dataForUi.id] optional - id provided from server data, use for recording close action
 * @param {Element} [dataForUi.linkButton] optional - button element with its own handlers, just append it
 * @param {String} [dataForUi.isDismissible=true] optional - can user close the notification
 */
function showBanner(container, noteElement, dataForUi){
    const {style, text, linkButton, id, isDismissible=true} = dataForUi;

    createBanner();
    addBanner();
    displayBannerWithAnimation();

    /**
     * using noteElement, style it and add to it
     * set data to ui
     */
    function createBanner(){
        setStylings(noteElement, noteElement, style, 'notificationbanner-icon');
        addText(noteElement, 'notificationbanner-text', text);
        addLinkButton(noteElement, linkButton, 'notificationbanner-link');
        handleCloseButton(container, noteElement, 'notificationbanner-close', isDismissible, id);
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
        displayNotificationWithAnimation(container, noteElement);
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
 * @param {Element} [dataForUi.linkButton] optional - button element with its own handlers, just append it
 */

function showBannerStatic(container, noteElement, dataForUi){
    const {style, text, linkButton} = dataForUi;

    createBannerStatic();
    addBannerStatic();

    /**
     * using noteElement, style it and add to it
     * set data to ui
     */
    function createBannerStatic(){
        //static banner has it background in separate element in the background
        const bgLevelElement = noteElement.querySelector(`.notificationbannerstatic-bg`);
        setStylings(bgLevelElement, noteElement, style, 'notificationbannerstatic-icon')
        addText(noteElement, 'notificationbannerstatic-text', text);
        addLinkButton(noteElement, linkButton, 'notificationbannerstatic-link');
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
 * @param {String} [dataForUi.id] optional - identification for data object, used to mark notification to hidden upon hide
 * @param {Element} [dataForUi.linkButton] optional - button element with its own handlers, just append it
 * @param {String} [dataForUi.title] optional - visible title text, most likely not given and setter gets defaults from this script
 * @param {String} [dataForUi.isDismissible=true] optional - can user close the notification
 * @param {String} [dataForUi.blocksInteraction=false] optional - use extra background to block interaction
 * @param {boolean} isStatic - should the notificaiton remain on screen waiting for input or using animation go away
 */
function showDialog(container, noteElement, dataForUi, isStatic){
    const {style, text, linkButton, id, title, isDismissible=true, blocksInteraction=false} = dataForUi;
    const backgroundElement = container.querySelector(`#notificationDialogsBg`);
    const contentContainerElement = container.querySelector(`#notificationDialogs`);

    setNotificationListBackground(backgroundElement, blocksInteraction);
    createDialog();
    addDialog();
    displayDialog();

    function createDialog(){
        setStylings(noteElement, noteElement, style, 'notificationdialog-icon');
        addTitle(noteElement, 'notificationdialog-title', style, title);
        addText(noteElement, 'notificationdialog-text', text);
        addLinkButton(noteElement, linkButton, 'notificationdialog-link');
        handleCloseButton(contentContainerElement, noteElement, 'notificationdialog-close', isDismissible, id, true, backgroundElement);
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
        displayNotificationWithAnimation(contentContainerElement, noteElement, animationUpdateObject, backgroundElement);
    }
}

//************************************************************************************** */
// Helper functions

/**
 * tests if notification data is acceptable format
 * @param {String|object} data
 * @returns {object} with valid and type fields
 */
function isInputDataFormatGood(data){
    const type = getInputDataType(data);
    return {
        isValid: type !== 'invalid',
        type: type
    }
};

/**
 *
 * @param {String|object} data data inputted to the showNotification function
 * @returns {String} object type as a string
 */
function getInputDataType(data){
    if (typeof data === 'string' || data instanceof String) {
        return 'string';
    }

    if (typeof data === 'object' && Object.keys(data).length !== 0 && Object.getPrototypeOf(data) === Object.prototype) {
        return 'object';
    }

    return 'invalid';
}

/**
 * Check what component style should apply,
 * get required additional style spesific data and pass it to correct show function
 *
 * @param {object} data notification dataobject
 */
function showCorrectStyleNotification(data){
    if(data.componentStyle === 'banner'){
        const componentInquiryData = {
            componentStyle: data.componentStyle,
            templateId: 'bannerTemplate',
            elementId: 'banner',
            containerId: 'banners'
        };
        getRequiredComponentData(componentInquiryData)
        .then(([container, noteElement]) => {
            showBanner(container, noteElement, {
                id: data.id,
                style: data.style,
                text: data.text,
                linkButton: data.linkButton,
                isDismissible: data.isDismissible,
            });
        })
        .catch(error =>{console.log(error);});
        return;
    }
    else if(data.componentStyle === 'banner_static'){
        const componentInquiryData = {
            componentStyle: data.componentStyle,
            templateId: 'bannerStaticTemplate',
            elementId: 'bannerStatic',
            containerId: 'bannner_statics'
        };
        getRequiredComponentData(componentInquiryData)
        .then(([container, noteElement]) => {
            showBannerStatic(container, noteElement, {
                id: data.id,
                style: data.style,
                text: data.text,
                linkButton: data.linkButton
            });
        })
        .catch(error =>{console.log(error);});
        return;
    }
    else if(data.componentStyle === 'dialog'){
        const componentInquiryData = {
            componentStyle: data.componentStyle,
            templateId: 'dialogTemplate',
            elementId: 'dialog',
            containerId: 'dialogs'
        };
        getRequiredComponentData(componentInquiryData)
        .then(([container, noteElement]) => {
            showDialog(container, noteElement, {
                id: data.id,
                style: data.style,
                text: data.text,
                title: data.title,
                isDismissible: data.isDismissible,
                blocksInteraction: data.blocksInteraction,
                linkButton: data.linkButton,
            }, true);
        })
        .catch(error =>{console.log(error);});
        return;
    }


    console.log('No proper componentStyle defined for showNotification');
}


/**
 * Function for loading container (where to put notifications) and notification document (what to put) data
 *
 * @param {object} componentInquiryData to simplify functioncall
 * @param {String} componentInquiryData.componentStyle notifications component style, for logging
 * @param {String} componentInquiryData.templateId html files template to fetch
 * @param {String} componentInquiryData.elementId element withing template
 * @param {String} componentInquiryData.containerId container within document to put elements into
 * @throws {Error} if at any point getting container and noteElement throws error
 * @returns {Promise}
 */
async function getRequiredComponentData(componentInquiryData){
    const {componentStyle, templateId, elementId, containerId} = componentInquiryData;
    return getNotificationElement(templateId, elementId)
    .then(noteElement => {
        const container = getContainerForNotifications(containerId);
        return [container, noteElement];
    })
    .catch(error => {
        console.log(`Error in getting component data for ${componentStyle}`);
        throw new Error(error);
    });
}

/**
 *
 * Get notification html element from html files correct template
 *
 * @param {String} templateId to get template with id from html file
 * @param {String} elementId to get element with id from template
 * @throws {Error} if no html document or root element is found, also if rootelement does not get argumens or error happens on the process
 * @returns {Promise} returns html document and if no html found throws error
 */
async function getNotificationElement(templateId, elementId){

    return getHtml('/../common/templates/notification.html')
    .then(html => {
        const doc = getElementRootDocument(html, templateId, elementId);
        if(doc){
            return doc;
        }
        throw new Error('No document from html');
    })
    .catch(error => {
        console.log('Error while fetching html: ', error);
        throw new Error(error);
    });

    async function getHtml(path){
        //TODO: fetch might be not the best option for long run so this might need revisioning
        //however its the most recommended way of handling it
        return fetch(path)
        .then(response => response.text())
        .then(html => {
            if(html){
                return html;
            }

            throw new Error('No html file found');
        })
        .catch(error => {throw new Error(error);});

    }
    //get template from document, and from template get spesific element root div
    function getElementRootDocument(html, templateId, elementId){

        if (arguments.length === 0 || !html || !templateId || !elementId) {
            throw new Error('getElementRootDocument needs arguments');
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const template = doc.getElementById(templateId);
        const fragment = template.content.cloneNode(true);
        const element = fragment.getElementById(elementId);

        if(element){
            return element;
        }

        throw new Error('No element found from html');
    }
}

/**
 * Get container where to put new htlm element to, add/look for "notifications"
 *
 * If no container is found throw error since usage should be within getNotificationElement implementation and its error catcher should pick it up
 *
 * @param {String} containerId if for container holding all notification elements
 * @throws {Error} of we did not find container where to put notifications
 * @returns {HTMLDivElement}
 */
function getContainerForNotifications(containerId){

    const container = document.getElementById(containerId);
    if(container){
        return container;
    }

    throw new Error(`No container for notification ${containerId}`);
}


/**
 * Handle elements visual style based on notification style setting. What kind of background color alert has etc.
 *
 * @param {HTMLDivElement} backgroundToStyleElement element thats background colos should be changed with style
 * @param {HTMLDivElement} iconContainerElement element that holds within the icon
 * @param {String} style what style is the element suppose to be
 * @param {String} iconId element id for icon
 */
function setStylings(backgroundToStyleElement, iconContainerElement, style, iconId){
    const styleObj = getNotificationColoursAndIconsWithStyle(style);

    backgroundToStyleElement.style.setProperty(`--style-background-color`, styleObj.bg);

    iconContainerElement.style.setProperty(`--style-icon-color`, styleObj.iconBg);
    iconContainerElement.querySelector(`.${iconId} .material-icons`).innerHTML = styleObj.icon;
}
/**
 *
 * @param {String} style notification style (info/alert etc.) based visible stylings
 */
function getNotificationColoursAndIconsWithStyle(style){
    if(style === 'success'){
        return {
          bg: 'var(--color-green-80)',
          iconBg: 'var(--color-green-100)',
          icon: 'check_circle_outline'
        };
      }
      else if(style === 'alert'){
        return {
          bg: 'var(--color-yellow-80)',
          iconBg: 'var(--color-blue-100)',
          icon: 'warning_amber'
        };
      }
      else if(style === 'error'){
        return {
          bg: 'var(--color-red-80)',
          iconBg: 'var(--color-red-100)',
          icon: 'report_gmailerrorred'
        };
      }

      // style 'info' is the default status message
      return {
        bg: 'var(--color-blue-60)',
        iconBg: 'var(--color-blue-100)',
        icon: 'error_outline'
      };
}
/**
 * Sets title, if not given sets default one
 * @param {HTMLDivElement} noteElement root element for visible notification item
 * @param {String} titleTextId titles text id
 * @param {String} style notification style
 * @param {String} [title] optional - title text to show
 * @returns
 */
function addTitle(noteElement, titleTextId, style, title){
    if(!title){
        addText(noteElement, titleTextId, getDefaultTitleText(style));
        return;
    }

    addText(noteElement, titleTextId, getDefaultTitleText(style));
}
/**
 *
 * @param {String} style notification style
 * @returns {String} default title conttent
 */
function getDefaultTitleText(style){
    if(style === 'info'){return 'Huomasithan';}
    else if(style === 'success'){return 'Onnistui';}
    else if(style === 'alert'){return 'Huomio';}
    else if(style === 'error'){return 'Virhe';}

    return 'Tuntematon';
  }

/**
 *
 * @param {HTMLDivElement} noteElement root element for visible notification item
 * @param {String} textId text element id
 * @param {String} text visible text
 */
function addText(noteElement, textId, text){
    noteElement.querySelector(`.${textId}`).innerHTML = text;
}
/**
 * @param {HTMLDivElement} noteElement root element for visible notification item
 * @param {Element} [linkButton] optional - possible link button to ui
 * @param {String} linkButtonId id for linkbutton
 * @returns
 */
function addLinkButton(noteElement, linkButton, linkButtonId){
    if(!linkButton || linkButton.nodeName !== 'BUTTON'){
        console.log('No linkButton set skipping');
        return;
    }

    noteElement.querySelector(`.${linkButtonId}`).style.display = 'flex';
    noteElement.querySelector(`.${linkButtonId}`).append(linkButton);
}

/**
 *
 * @param {HTMLDivElement} container root element holding noteElements
 * @param {HTMLDivElement} noteElement root element for visible notification item
 * @param {String} closeButtonId element id for close button
 * @param {boolean} canDismiss can user close the notification
 * @param {String} [notificationId] optional - notification id if provided to record close action
 * @param {boolean} [removeElementOnClose=true] optional - should the whole element be removed after close, self cleaning, no need for clean routines
 * @param {HTMLDivElement} [backgroundElement] optional - separate background element for content container to be hidden if last element was removed
 * @returns
 */
function handleCloseButton(container, noteElement, closeButtonId, canDismiss=true, notificationId, removeElementOnClose = true, backgroundElement){
    if(canDismiss){
        addCloseButton(container, noteElement, closeButtonId, notificationId, removeElementOnClose, backgroundElement);
        return;
    }
    hideCloseButton(noteElement, closeButtonId);
}

/**
 *
 * @param {HTMLDivElement} container root element holding noteElements
 * @param {HTMLDivElement} noteElement root element for visible notification item
 * @param {String} closeButtonId element id for close button
 * @param {String} [notificationId] optional - notification id if provided to record close action
 * @param {boolean} [removeElementOnClose=true] optional - should the whole element be removed after close, self cleaning, no need for clean routines
 * @param {HTMLDivElement} [backgroundElement] optional - separate background element for content container to be hidden if last element was removed
 */
function addCloseButton(container, noteElement, closeButtonId, notificationId, removeElementOnClose = true, backgroundElement){
    noteElement.querySelector(`.${closeButtonId}`).addEventListener('click', (event) => {
        eventHandled(event);
        noteElement.style.visibility = 'collapse';

         if(notificationId){
          const idString = `notification_${notificationId}`;
          localStorage.setItem(idString, '1');
        }

        if(removeElementOnClose){
            removeItemFromContainer(container, noteElement, backgroundElement);
        }
      });
}

/**
 * Hide notification list background element if no active notifications on the list
 * Show with "setNotificationListBackground" within notification styles show function
 *
 * @param {HTMLDivElement} container root element holding noteElements
 * @param {HTMLDivElement} backgroundElement separate background element for content container to be hidden if last element was removed
 */
function hideBackgroundIfNoActiveChildren(container, backgroundElement){

    //if no element provided ignore this
    if(!container || !backgroundElement){
        return;
    }

    //if has children visible ignore this
    if(hasActiveChildren()){
        return;
    }

    setNotificationListBackground(backgroundElement, false);

    function hasActiveChildren(){
        const children = Array.from(container.children);
        let isActive = false;

        //theres no breaking out of the foreach... so using helper variable
        //personally I would have preferred for...of
        children.forEach(child => {
            const computedStyle = window.getComputedStyle(child);
            const visibility = computedStyle.getPropertyValue('visibility');

            if(visibility === 'visible'){
              isActive = true;
            }
          });

          return isActive;
    }
}

/**
 *
 * @param {HTMLDivElement} noteElement root element for visible notification item
 * @param {String} closeButtonId element id for close button
 */
function hideCloseButton(noteElement, closeButtonId){
    noteElement.querySelector(`.${closeButtonId}`).style.visibility = 'hidden';
}

/**
 * NOTE! currently only supported by dialog
 *
 * @param {HTMLDivElement} backgroundElement element that works as background
 * @param {boolean} showBackground should the element be visible and blocking interface
 */
function setNotificationListBackground(backgroundElement, showBackground = false){
    backgroundElement.style.visibility = showBackground ? 'visible' : 'hidden';
    backgroundElement.style.pointerEvents = showBackground ? 'unset' : 'auto';
}

/**
 * Show and hide (or just show) automatically with css animation the element
 * Can autoremove elements upon animation end
 *
 * @param {HTMLDivElement} container root element holding noteElements
 * @param {HTMLDivElement} noteElement root element for visible notification item
 * @param {object} [animationInfoObj] optional - object to hold additional information of animation
 * @param {String} [animationInfoObj.classIdForAnimationElement] optional - css class for animation, use "show-and-hide" for normal usage and if listenAnimationToEnd: false then only use "show" class
 * @param {boolean} [animationInfoObj.listenAnimationToEnd] optional - should we expect to have end animation, use proper class element for setting css animation
 * @param {String} [animationInfoObj.animationStartName] optional - animation name for start listener to check up on
 * @param {String} [animationInfoObj.animationEndName] optional - animation name for end listener to check up on
 * @param {String} [animationInfoObj.animationEndVisibilityStyle] optional - how we hide element after animation ends
 * @param {boolean} [animationInfoObj.removeElementOnClose] optional - should the whole element be removed after close, self cleaning, no need for clean routines
 * @param {String} [animationInfoObj.onAnimationStart] optional - what to do after animation start
 * @param {String} [animationInfoObj.onAnimationEnd] optional - what to do after animation end (by default before this call hides element visibility)
 * @param {HTMLDivElement} [backgroundElement] optional - separate background element for content container to be hidden if last element was removed
 *
 */
function displayNotificationWithAnimation(container , noteElement, animationInfoObj, backgroundElement){
    //default settings
    const defaultAnimationSettings = {
        'classIdForAnimationElement': 'show-and-hide',
        'listenAnimationToEnd': true,
        'animationStartName': 'fadein',
        'animationEndName': 'fadeout',
        'animationEndVisibilityStyle': 'collapse',
        'removeElementOnClose': true

        //'onAnimationStart': someFunctionCall(),
        //'onAnimationEnd': someFunctionCall(),
    };
    //use default values
    let animationSettingsObject = defaultAnimationSettings;
    //if update objet provided update with it the object
    if(animationInfoObj){
        animationSettingsObject = {...defaultAnimationSettings, ...animationInfoObj};
    }
    const {classIdForAnimationElement, listenAnimationToEnd, animationStartName, animationEndName, animationEndVisibilityStyle, removeElementOnClose, onAnimationStart, onAnimationEnd} = animationSettingsObject;


    //set listeners
    setAnimationStartListener();
    if(listenAnimationToEnd){
        setAnimationEndListener();
    }

    //add class to autostart required animations
    noteElement.classList.add(classIdForAnimationElement);


    //functions
    function setAnimationStartListener(){
        noteElement.onanimationstart = (event) =>{
            if(event.animationName === animationStartName){
                if(onAnimationStart){
                    onAnimationStart();
                }
            }
        };
    }
    function setAnimationEndListener(){
        noteElement.onanimationend = (event) => {
            if (event.animationName === animationEndName) {
                noteElement.style.visibility = animationEndVisibilityStyle;

                if(onAnimationEnd){
                    onAnimationEnd();
                }

                if(removeElementOnClose){
                    removeItemFromContainer(container, noteElement, backgroundElement);
                }
            }
        };
    }
}

/**
 * Remove notification item from container holding them, if theres a background element for that container check should it be hidden
 * Closing notificaiton or if timed animation closes it this should be called
 *
 * @param {HTMLDivElement} container root element holding noteElements
 * @param {HTMLDivElement} noteElement root element for visible notification item
 * @param {HTMLDivElement} [backgroundElement]  optional - separate background element for content container to be hidden if last element was removed
 */
function removeItemFromContainer(container, noteElement, backgroundElement){
    container.removeChild(noteElement);
    hideBackgroundIfNoActiveChildren(container, backgroundElement);
}

/**
 * Check is single datapoint is acceptable
 * @param {*} data uncertain data type
 * @param {String[]} validTypeArray different types of data, see typeof documentation, self build support for 'array' type
 * @throws {Error} if validtype array is not array
 * @returns {boolean} true if data type is found from array
 */
function isDataValidType(data, validTypeArray){
    if(!Array.isArray(validTypeArray)){
        throw new Error('isDataValidType valid array parameter should be array of acceptable types');
    }
    const dataType = typeof data;
    //typeof lists arrays as types of objects so exaception handler here for easier support for array in validTypeArray
    return validTypeArray.includes(dataType) || (validTypeArray.includes('array') && isDataTypeOf(data, 'array'));
}
/**
 *
 * @param {*} data uncertain data
 * @param {String} expectedType what type should the data be ?
 * @returns {boolean} is the data expected type
 */
function isDataTypeOf(data, expectedType){
    const dataType = typeof data;
    return expectedType === dataType || (dataType === 'object' && expectedType === 'array' && Array.isArray(data));
}

/**
 * Creates clickable link button element.
 * In order to open external url correctly its format is checked and only absolute format is accepted.
 * IF relative path is required please update
 *
 * @param {object} dataObject data object for holding
 * @param {String} dataObject.text visible text for link
 * @param {String} dataObject.url link to open
 * @returns {undefined|Element} return undefined if could not create button return button element with url click
 */
function createLinkButton(dataObject){
    if(!dataObject){
        console.log('Dataobject not set for linkbutton. Skipping');
        return undefined;
    }
    const {text, url} = dataObject;
    if(!text || !url){
        console.log('Missing data when creating link button');
        return undefined;
    }
    //see if url given is relative or absolute
    //relative ones try to open with pages baseURI. We most likely want here to open external site so we want absolute
    //essentially we want url with http: or https:
    if(!isAbsoluteURL(url)){
        console.log('Link button url set to relative please check url format');
        return undefined;
    }

    const linkBtn = document.createElement('button');
    linkBtn.innerHTML = text;
    linkBtn.title = url;
    linkBtn.addEventListener('click', () => {
        //Note. If opened tab is baseURI + url provided then url came with relative url
        //in order to correctly open new tab with url use absolute url, check data
        window.open(url);
    });
    return linkBtn;

    /**
     * Test function to check format of the url
     * @param {String} testUrl url to test if its relative or not
     * @returns {boolean} if url is constructed successfully its absolute path
     */
    function isAbsoluteURL(testUrl){
        try {
            //try to construct URL with test string
            new URL(testUrl);
            return true;//absolute
        } catch (error) {
            if (error instanceof TypeError) {
                return false;//relative
            }

            //other error, default to it being relative because it fails out
            console.log(error);
            return false;
        }
    }
}