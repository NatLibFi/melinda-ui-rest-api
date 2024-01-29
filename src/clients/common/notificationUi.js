
/**
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
 * @param {object} data dataobject either from server or set by hand
 * @param {String} data.componentStyle server data, also supply self, in what format do we show the notification banner/dialog ... ?
 * @param {String} data.style what kind of info notification show inffo/error etc. ?
 * @param {String} data.text visible text to show
 * @param {String} [data.title] optional - visible title text, used for dialog, if not given sets one
 * @param {String} [data.id] optional - identification for data object, used for hiding/showing server message
 * @param {String} [data.messageStyle] optional - server data, will be automatically moved to style field
 * @param {String} [data.messageText] optional - server data, will be automatically moved to text field
 * @param {String} [data.isDismissible] optional - server data, also supply self, used in dialog, can user close notification
 * @param {String} [data.blocksInteraction] optional - server data, also supply self, used in dialog, does notification have overlay behind it that blocks UI usage
 * @param {html} [data.linkButton] optional - button element to forward to some link address, available on componentStyle banner and dialog
 */
export function showNotification(data){
    /**
     * Check data validity (theres data and in general is it in ok form)
     * String and Object based data have separation, string has default values while object
     * expects to use provided data (some data optional, check in actual use case) 
     */

    //data available check
    if (arguments.length === 0 || !data) {
        console.log('showNotification needs arguments');
        return;
    }

    //test if data is in acceptable format
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
    showCorrectStyleNotification({
        id: data.id,
        componentStyle: data.componentStyle,
        title: data.title,
        style: isDataFromServer ?  data.messageStyle : data.style,
        text: isDataFromServer ?  data.messageText : data.text,
        linkButton: data.linkButton,
        isDismissible: data.isDismissible,
        blocksInteraction: data.blocksInteraction
    });
}

//************************************************************************************** */
// Constructor/Show functions:

/**
 * Banner
 * 
 * @param {html} container container within document to hold shown notifications
 * @param {html} noteDocument template html document for said notification style 
 * @param {object} dataForUi object for holding required data to show on ui
 * @param {String} dataForUi.style how does the notification itself should look like info/error etc.
 * @param {String} dataForUi.text visible text
 * @param {String} [dataForUi.id] optional - id provided from server data, use for recording close action
 * @param {html} [dataForUi.linkButton] optional - button element with its own handlers, just append it 
 */
function showBanner(container, noteDocument, dataForUi){
    console.log('showBanner');
    const {style, text, linkButton, id} = dataForUi;

    createBanner();
    addBanner();
    displayBannerWithAnimation();

    /**
     * using noteDocument, style it and add to it
     * set data to ui
     */
    function createBanner(){
        setStylings(noteDocument, style, 'notificationbanner-icon');
        addText(noteDocument, 'notificationbanner-text', text);
        addLinkButton(noteDocument, linkButton, 'notificationbanner-link');
        addCloseButton(container, noteDocument, 'notificationbanner-close', id);
    }
    /**
     * Add noteDocument to container
     */
    function addBanner(){
        container.prepend(noteDocument);
    }
    /**
     * Handles animation start/end and listeners for them,
     * call displayNotificationWithAnimation, you can provide override/update object to modify behaviour
     * if not given using default settings from the 
     */
    function displayBannerWithAnimation(){
        displayNotificationWithAnimation(container, noteDocument);
    }
}

/**
 * Banner Static
 * 
 * @param {html} container container within document to hold shown notifications
 * @param {html} noteDocument template html document for said notification style 
 * @param {object} dataForUi object for holding required data to show on ui
 * @param {String} dataForUi.style how does the notification itself should look like info/error etc.
 * @param {String} dataForUi.text visible text
 */

function showBannerStatic(container, noteDocument, dataForUi){
    console.log('showBannerStatic');
    const {style, text} = dataForUi;

    createBannerStatic();
    addBannerStatic();

    /**
     * using noteDocument, style it and add to it
     * set data to ui
     */
    function createBannerStatic(){
        setStylings(noteDocument, style, 'notificationbannerstatic-icon');
        addText(noteDocument, 'notificationbannerstatic-text', text);
    }
    /**
     * Add noteDocument to container
     */
    function addBannerStatic(){
        //TODO: currently can have multiple static banners but should we ?
        //hackish solution would be just clear the old ones before setting so last one to set would be visible...
        //for now just add all and let data handle how many are active at the same time
        container.prepend(noteDocument);
    }
}
/**
 * Dialog
 * 
 * @param {html} container container within document to hold shown notifications
 * @param {html} noteDocument template html document for said notification style 
 * @param {object} dataForUi object for holding required data to show on ui
 * @param {String} dataForUi.style how does the notification itself should look like info/error etc.
 * @param {String} dataForUi.text visible text
 * @param {String} [dataForUi.id] optional - identification for data object, used to mark notification to hidden upon hide
 * @param {*} [dataForUi.linkButton] optional - button element with its own handlers, just append it 
 * @param {String} [dataForUi.title] optional - visible title text 
 * @param {Boolean} isStatic should the dialog remove itself with time
 * @param {Boolean} canDismiss can user press some closing mechanism ie. close button
 * @param {Boolean} showBackground show semitransparent background behind dialogs that blocks users interaction with ui
 */
function showDialog(container, noteDocument, dataForUi){
    console.log('showDialog');
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
        .then(([container, noteDocument]) => {
            showBanner(container, noteDocument, {
                id: data.id,
                style: data.style, 
                text: data.text, 
                linkButton: data.linkButton
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
        .then(([container, noteDocument]) => {
            showBannerStatic(container, noteDocument, {
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
        .then(([container, noteDocument]) => {
            showDialog(container, noteDocument, {
                id: data.id, 
                style: data.style, 
                text: data.text, 
                title: data.title
            }, true, !data.isDismissible, data.blocksInteraction);
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
 * @returns {Promise}
 */
async function getRequiredComponentData(componentInquiryData){
    const {componentStyle, templateId, elementId, containerId} = componentInquiryData;
    return getNotificationDocument(templateId, elementId)
    .then(noteDocument => {
        const container = getContainerForNotifications(containerId);
        return [container, noteDocument];
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
 * @returns {Promise} returns html document and if no html found throws error
 */
async function getNotificationDocument(templateId, elementId){

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
 * If no container is found throw error since usage should be within getNotificationDocument implementation and its error catcher should pick it up
 * 
 * @param {String} containerId if for container holding all notification elements
 * @returns {html}
 */
function getContainerForNotifications(containerId){
    
    const container = document.getElementById(containerId);
    if(container){
        return container;
    }

    throw new Error(`No container for notification ${containerId}`);
}


/**
 * 
 * @param {html} noteDocument root element for visible notification item
 * @param {String} style what style is the element suppose to be
 * @param {String} iconId element id for icon
 */
function setStylings(noteDocument, style, iconId){
    const styleObj = getNotificationColoursAndIconsWithStyle(style);

    noteDocument.style.setProperty(`--style-background-color`, styleObj.bg);
    noteDocument.style.setProperty(`--style-icon-color`, styleObj.iconBg);
    noteDocument.querySelector(`.${iconId} .material-icons`).innerHTML = styleObj.icon;
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
 * 
 * @param {*} noteDocument root element for visible notification item
 * @param {*} textId text element id
 * @param {*} text visible text
 */
function addText(noteDocument, textId, text){
    noteDocument.querySelector(`.${textId}`).innerHTML = text;
}
/**
 * @param {*} noteDocument root element for visible notification item
 * @param {html} [linkButton] optional - possible link button to ui
 * @param {String} linkButtonId id for linkbutton
 * @returns 
 */
function addLinkButton(noteDocument, linkButton, linkButtonId){
    if(!linkButton || linkButton.nodeName !== 'BUTTON'){
        console.log('No linkButton set skipping');
        return;
    }

    noteDocument.querySelector(`.${linkButtonId}`).style.display = 'flex';
    noteDocument.querySelector(`.${linkButtonId}`).append(linkButton);
}

/**
 * 
 * @param {html} container root element holding noteDocuments
 * @param {html} noteDocument root element for visible notification item
 * @param {String} closeButtonId element id for close button
 * @param {String} [notificationId] optional - notification id if provided to record close action
 * @param {boolean} [removeElementOnClose=true] optional - should the whole element be removed after close, self cleaning, no need for clean routines
 */
function addCloseButton(container, noteDocument, closeButtonId, notificationId, removeElementOnClose = true){
    noteDocument.querySelector(`.${closeButtonId}`).addEventListener('click', (event) => {
        eventHandled(event);
        noteDocument.style.visibility = 'collapse';
  
         if(notificationId){
          const idString = `notification_${notificationId}`;
          localStorage.setItem(idString, '1');
        }

        if(removeElementOnClose){
            container.removeChild(noteDocument);
        }
      });
}

/**
 * Show and hide (or just show) automatically with css animation the element
 *  
 * @param {html} container root element holding noteDocuments
 * @param {html} noteDocument root element for visible notification item
 * @param {object} [animationInfoObj] optional - object to hold additional information of animation
 * @param {String} [animationInfoObj.classIdForAnimationElement] optional - css class for animation, use "show-and-hide" for normal usage and if listenAnimationToEnd: false then only use "show" class
 * @param {boolean} [animationInfoObj.listenAnimationToEnd] optional - should we expect to have end animation, use proper class element for setting css animation
 * @param {String} [animationInfoObj.animationStartName] optional - animation name for start listener to check up on
 * @param {String} [animationInfoObj.animationEndName] optional - animation name for end listener to check up on
 * @param {String} [animationInfoObj.animationEndVisibilityStyle] optional - how we hide element after animation ends
 * @param {boolean} [animationInfoObj.removeElementOnClose] optional - should the whole element be removed after close, self cleaning, no need for clean routines
 * @param {String} [animationInfoObj.onAnimationStart] optional - what to do after animation start
 * @param {String} [animationInfoObj.onAnimationEnd] optional - what to do after animation end (by default before this call hides element visibility)
 * 
 */
function displayNotificationWithAnimation(container , noteDocument, animationInfoObj){
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
    noteDocument.classList.add(classIdForAnimationElement);


    //functions
    function setAnimationStartListener(){
        noteDocument.onanimationstart = (event) =>{
            if(event.animationName === animationStartName){
                if(onAnimationStart){
                    onAnimationStart();
                }
            }
        };
    }
    function setAnimationEndListener(){
        noteDocument.onanimationend = (event) => {
            if (event.animationName === animationEndName) {
                noteDocument.style.visibility = animationEndVisibilityStyle;

                if(onAnimationEnd){
                    onAnimationEnd();
                }

                if(removeElementOnClose){
                    container.removeChild(noteDocument);
                }
            }
        };
    }
}