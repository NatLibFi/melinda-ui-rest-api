
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
 * @param {*} [data.linkButton] optional - button element to forward to some link address, available on componentStyle banner and dialog
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
// Constructor functions:

/**
 * Banner
 * 
 * @param {html} container container within document to hold shown notifications
 * @param {html} noteDocument template html document for said notification style 
 * @param {object} dataForUi object for holding required data to show on ui
 * @param {String} dataForUi.style how does the notification itself should look like info/error etc.
 * @param {String} dataForUi.text visible text
 * @param {*} [dataForUi.linkButton] optional - button element with its own handlers, just append it 
 */
function showBanner(container, noteDocument, dataForUi){
    console.log('showBanner');
}

/**
 * Banner Static
 * 
 * @param {html} container container within document to hold shown notifications
 * @param {html} noteDocument template html document for said notification style 
 * @param {object} dataForUi object for holding required data to show on ui
 * @param {String} dataForUi.style how does the notification itself should look like info/error etc.
 * @param {String} dataForUi.text visible text
 * @param {String} [dataForUi.id] optional string identification for data object, used to mark notification to hidden upon hide
 * @param {*} [dataForUi.linkButton] optional - button element with its own handlers, just append it 
 */

function showBannerStatic(container, noteDocument, dataForUi){
    console.log('showBannerStatic');
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
        //TODO: fetch might be not the best option for lond run so this might need revisioning
        const response = await fetch(path);
        const html = await response.text();
        if(html){
            return html;
        }

        throw new Error('No html file fetched');
    }
    //get template from document, and from template get spesific element root div
    function getElementRootDocument(html, templateId, elementId){
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