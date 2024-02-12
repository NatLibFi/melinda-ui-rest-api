//************************************************************************************** */
// Helper functions for notifiationUi.js


/**
 * Handle elements visual style based on notification style setting. What kind of background color alert has etc.
 *
 * @param {HTMLDivElement} backgroundToStyleElement element thats background colos should be changed with style
 * @param {HTMLDivElement} iconContainerElement element that holds within the icon
 * @param {String} style what style is the element suppose to be
 * @param {String} iconId element id for icon
 */
export function setStylings(backgroundToStyleElement, iconContainerElement, style, iconId){
    const styleObj = getNotificationColoursAndIconsWithStyle(style);

    backgroundToStyleElement.style.setProperty(`--style-background-color`, styleObj.bg);

    iconContainerElement.style.setProperty(`--style-icon-color`, styleObj.iconBg);
    iconContainerElement.querySelector(`.${iconId} .material-icons`).innerHTML = styleObj.icon;
}
/**
 *
 * @param {String} style notification style (info/alert etc.) based visible stylings
 */
export function getNotificationColoursAndIconsWithStyle(style){
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
export function addTitle(noteElement, titleTextId, style, title){
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
export function getDefaultTitleText(style){
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
export function addText(noteElement, textId, text){
    noteElement.querySelector(`.${textId}`).innerHTML = text;
}

/**
 * Add button element to div
 * @param {HTMLDivElement} noteElement notification element
 * @param {Element} buttonElement button element to add
 * @param {String} buttonContainerId identification for where to place button
 * @param {boolean} [removeContainer=true] if given button element is not available remove the container where its suppose to be set
 * @returns when data is not correct to set up button
 */
export function addButton(noteElement, buttonElement, buttonContainerId, removeContainer=true){
    if(!buttonElement){
        //console.log('No button data to set. Skipping');
        if(removeContainer){
            removeElementFromContainer(noteElement, buttonContainerId);
        }

        return;
    }
    if(buttonElement.nodeName !== 'BUTTON'){
        console.log('Trying to set none button');
        return;
    }

    noteElement.querySelector(`.${buttonContainerId}`).style.display = 'flex';
    noteElement.querySelector(`.${buttonContainerId}`).append(buttonElement);
}

/**
 *
 * @param {HTMLDivElement} container root element holding noteElements
 * @param {HTMLDivElement} noteElement root element for visible notification item
 * @param {String} closeButtonId element id for close button
 * @param {boolean} canDismiss can user close the notification
 * @param {String} [notificationId] optional - notification id if provided to record close action
 * @param {String} [closePrefix] optional - prefix for closing, used to save to local storage, comes from config, used only if id present
 * @param {boolean} [removeElementOnClose=true] optional - should the whole element be removed after close, self cleaning, no need for clean routines
 * @param {HTMLDivElement} [backgroundElement] optional - separate background element for content container to be hidden if last element was removed
 * @returns
 */
export function handleCloseButton(container, noteElement, closeButtonId, canDismiss=true, notificationId, closePrefix, removeElementOnClose = true, backgroundElement){
    if(canDismiss){
        addCloseButton(container, noteElement, closeButtonId, notificationId, closePrefix, removeElementOnClose, backgroundElement);
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
 * @param {String} [closePrefix] optional - prefix for closing, used to save to local storage, comes from config, used only if id present
 * @param {boolean} [removeElementOnClose=true] optional - should the whole element be removed after close, self cleaning, no need for clean routines
 * @param {HTMLDivElement} [backgroundElement] optional - separate background element for content container to be hidden if last element was removed
 */
export function addCloseButton(container, noteElement, closeButtonId,  notificationId, closePrefix, removeElementOnClose = true, backgroundElement){
    noteElement.querySelector(`.${closeButtonId}`).addEventListener('click', (event) => {
        eventHandled(event);
        closeNotification(container, noteElement, notificationId, closePrefix, backgroundElement, removeElementOnClose);
    });
}

/**
 * Closes notification, removes element (and background if needed) and marks notification as seen (if id given)
 *
 * @param {HTMLDivElement} container root element holding noteElements
 * @param {HTMLDivElement} noteElement root element for visible notification item
 * @param {String} [notificationId] optional - notification id if provided to record close action
 * @param {String} [closePrefix] optional - prefix for closing, used to save to local storage, comes from config, used only if id present
 * @param {HTMLDivElement} [backgroundElement] optional - separate background element for content container to be hidden if last element was removed
 * @param {boolean} [removeElementOnClose=true] optional - should the whole element be removed after close, self cleaning, no need for clean routines
 */
export function closeNotification(container, noteElement, notificationId, closePrefix, backgroundElement, removeElementOnClose = true){
    noteElement.style.visibility = 'collapse';

    if(notificationId && closePrefix){
        const idString = `${closePrefix}_${notificationId}`;
        localStorage.setItem(idString, '1');
    }

    if(removeElementOnClose){
        removeItemFromContainer(container, noteElement, backgroundElement);
    }
}

/**
 * Hide notification list background element if no active notifications on the list
 * Show with "setNotificationListBackground" within notification styles show function
 *
 * @param {HTMLDivElement} container root element holding noteElements
 * @param {HTMLDivElement} backgroundElement separate background element for content container to be hidden if last element was removed
 */
export function hideBackgroundIfNoActiveChildren(container, backgroundElement){

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
 * @param {boolean} [removeContainer=true] should remove whole container
 */
export function hideCloseButton(noteElement, closeButtonId, removeContainer=true){
    noteElement.querySelector(`.${closeButtonId}`).style.visibility = 'collapse';
    if(removeContainer){
        removeElementFromContainer(noteElement, closeButtonId);
    }
}

/**
 * NOTE! currently only supported by dialog
 *
 * @param {HTMLDivElement} backgroundElement element that works as background
 * @param {boolean} showBackground should the element be visible and blocking interface
 */
export function setNotificationListBackground(backgroundElement, showBackground = false){
    if(!backgroundElement || !backgroundElement.style){
        //console.log('Background element missing');
        return;
    }

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
 * @param {String} [notificationId] optional - notification id if provided to record close action
 * @param {String} [closePrefix] optional - prefix for closing, used to save to local storage, comes from config, used only if id present
 *
 */
export function displayNotificationWithAnimation(container, noteElement, animationInfoObj, backgroundElement, notificationId, closePrefix){
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
                    closeNotification(container, noteElement, notificationId, closePrefix, backgroundElement, removeElementOnClose);
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
export function removeItemFromContainer(container, noteElement, backgroundElement){
    container.removeChild(noteElement);
    hideBackgroundIfNoActiveChildren(container, backgroundElement);
}

/**
 * General remove function for easier removing some element from container
 * @param {HTMLDivElement} container upper element thats suppose to hold element thats required to remove
 * @param {String} idOrClassName either class name or element id to seach
 * @param {boolean} [useQuery=true] query based on class if false try to find with id
 */
export function removeElementFromContainer(container, idOrClassName, useQuery=true){
    if(!container || !idOrClassName){
        console.log('removeElementFromContainer missing parameters');
        return;
    }
    let element = fetchElement(container, idOrClassName, useQuery);
    if(!element){
        //console.log('No element to remove');
        return;
    }
    //since element can be nested more deeply within container element just get the elements parent and with that remove child
    const parent = element.parentNode;
    if(!parent){
        //console.log('Did not find element parent node to remove element');
        return;
    }
    //remove sub element
    parent.removeChild(element);

    function fetchElement(container, idOrClassName, useQuery){
        if(useQuery){
            return container.querySelector(`.${idOrClassName}`);
        }

        return container.getElementById(idOrClassName);
    }
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
export function createLinkButton(dataObject){
    if(!dataObject){
        //console.log('Dataobject not set for linkbutton. Skipping');
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

/**
 * Construct styled action button to given style
 *
 * @param {String} style What style of notificaiton are we talking about
 * @param {object} buttonData data object for holding
 * @param {String} buttonData.text visible text
 * @param {CallableFunction} buttonData.onClick action on press
 * @param {CallableFunction} afterClick any cleanup work after click?
 * @returns {undefined|Element} get button or nothing
 */
export function createActionButton(style, buttonData, afterClick){

    //check priamry data
    if(!style || !buttonData){
        //console.log('Action Button misses some data');
        return undefined;
    }

    //deconstruct and check data again
    const {text,onClick} = buttonData;

    if(!text || !onClick){
        console.log('Action buttons data object is lacking');
        return undefined;
    }

    //create element
    const actionBtn = document.createElement('button');
    //add data to element and return it
    actionBtn.innerHTML = text;
    setClassesForButton(style, actionBtn);
    actionBtn.addEventListener('click', () => {
        onClick();

        //mosatly for cleanup job within this script, should not be expected from outside
        if(afterClick){
            afterClick();
        }
    });
    return actionBtn;

    /**
     * Gets defined css classes for button and sets them in order
     * @param {String} style notification style
     * @param {Element} button action buttons element
     */
    function setClassesForButton(style, button){
        const classArray = getClassesForButton(style);
        for (const className of classArray) {
            button.classList.add(className);
        }
    }
    /**
     * Get class to style the button each .className in css should be here defined as own element to array, they will be run in order to button element so note the order you push to array
     * ie. in css .button.red.inverse should be here in array as ['button', 'red', 'inverse']
     * @param {String} style whats the notification visual style
     * @returns {String} if style is found return corresponding css class for it
     */
    function getClassesForButton(style){
        let classArray = ['button'];
        //TODO: update classnames
        //TODO: theres simple colord ones like info button defined already, but as design document pointed, this so now using only two types of color code for buttons
        // if(style === 'success'){
        //     classArray.push('green');
        //     return classArray;
        // }
        // else if(style === 'alert'){
        //     classArray.push('yellow');
        //     return classArray;
        // }
        // else if(style === 'error'){
        //     classArray.push('red');
        //     return classArray;
        // }

        if(style === 'error'){
            classArray.push('alternate-red');
            return classArray;
        }

        //default to info style
        classArray.push('blue');
        return classArray;
    };
}
