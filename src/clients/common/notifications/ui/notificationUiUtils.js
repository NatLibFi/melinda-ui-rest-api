import {dataUtils} from '/../common/notifications/data/notificationDataProcessor.js';

//************************************************************************************** */
// Helper functions for notifiationUi.js


/**
 * Handle elements visual style based on notification style setting. What kind of background color alert has etc.
 *
 * @param {object} paramObj object delivery for function
 * @param {HTMLDivElement} paramObj.backgroundToStyleElement element thats background colos should be changed with style
 * @param {HTMLDivElement} paramObj.iconContainerElement element that holds within the icon
 * @param {String} paramObj.style what style is the element suppose to be
 * @param {String} paramObj.iconId element id for icon
 */
export function setStylings(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {backgroundToStyleElement, iconContainerElement, style, iconId} = paramObj;

  const styleObj = getNotificationColoursAndIconsWithStyle({style});

  backgroundToStyleElement.style.setProperty(`--style-background-color`, styleObj.bg);

  iconContainerElement.style.setProperty(`--style-icon-color`, styleObj.iconBg);
  iconContainerElement.querySelector(`.${iconId} .material-icons`).innerHTML = styleObj.icon;
}

/**
 * Sets title, if not given sets default one
 *
 * @param {object} paramObj object delivery for function
 * @param {HTMLDivElement} paramObj.noteElement root element for visible notification item
 * @param {String} paramObj.titleTextId titles text id
 * @param {String} paramObj.style notification style
 * @param {String} [paramObj.title] optional - title text to show
 * @returns
 */
export function addTitle(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {noteElement, titleTextId, style, title} = paramObj;

  if (!title) {
    addText({noteElement, textId: titleTextId, text: getDefaultTitleText({style})});
    return;
  }

  addText({noteElement, textId: titleTextId, text: title});
}

/**
 *
 * @param {object} paramObj object delivery for function
 * @param {HTMLDivElement} paramObj.noteElement root element for visible notification item
 * @param {String} paramObj.textId text element id
 * @param {String} paramObj.text visible text
 */
export function addText(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {noteElement, textId, text} = paramObj;

  noteElement.querySelector(`.${textId}`).innerHTML = text;
}

/**
 * Add button element to div
 * IF theres no button data on the buttonElement the div thats suppose to hold the button is removed
 *
 * @param {object} paramObj object delivery for function
 * @param {HTMLDivElement} paramObj.noteElement notification element
 * @param {Element} paramObj.buttonElement button element to add
 * @param {String} paramObj.buttonContainerId identification for where to place button
 * @param {boolean} [paramObj.removeContainer=true] if given button element is not available remove the container where its suppose to be set, defaults to true
 * @returns when data is not correct to set up button
 */
export function addButton(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {noteElement, buttonElement, buttonContainerId, removeContainer = true} = paramObj;

  //if no button data either remove container or move on without setting the button
  //can be ovveriden, by default removes the container
  if (!buttonElement) {
    if (removeContainer) {
      const buttonContainer = noteElement.querySelector(`.${buttonContainerId}`);
      removeElementFromContainer({container: noteElement, elementToRemove: buttonContainer});
    }

    return;
  }
  if (buttonElement.nodeName !== 'BUTTON') {
    console.error('Trying to set none button');
    return;
  }

  noteElement.querySelector(`.${buttonContainerId}`).style.display = 'flex';
  noteElement.querySelector(`.${buttonContainerId}`).append(buttonElement);
}

/**
 *
 * @param {object} paramObj object delivery for function
 * @param {HTMLDivElement} paramObj.container root element holding noteElements
 * @param {HTMLDivElement} paramObj.noteElement root element for visible notification item
 * @param {String} paramObj.closeButtonId element id for close button
 * @param {boolean} paramObj.canDismiss can user close the notification
 * @param {String} [paramObj.notificationId] optional - notification id if provided to record close action
 * @param {boolean} [paramObj.removeElementOnClose=true] optional - should the whole element be removed after close, self cleaning, no need for clean routines, defaults to true
 * @param {HTMLDivElement} [paramObj.backgroundElement] optional - separate background element for content container to be hidden if last element was removed
 * @returns
 */
export function handleCloseButton(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {container, noteElement, closeButtonId, canDismiss = true, notificationId, removeElementOnClose = true, backgroundElement} = paramObj;

  if (canDismiss) {
    addCloseButton({container, noteElement, closeButtonId, notificationId, removeElementOnClose, backgroundElement});
    return;
  }
  hideCloseButton({noteElement, closeButtonId});
}

/**
 * Closes notification, removes element (and background if needed) and marks notification as seen (if id given)
 *
 * @param {object} paramObj object delivery for function
 * @param {HTMLDivElement} paramObj.container root element holding noteElements
 * @param {HTMLDivElement} paramObj.noteElement root element for visible notification item
 * @param {String} [paramObj.notificationId] optional - notification id if provided to record close action
 * @param {HTMLDivElement} [paramObj.backgroundElement] optional - separate background element for content container to be hidden if last element was removed
 * @param {boolean} [paramObj.removeElementOnClose=true] optional - should the whole element be removed after close, self cleaning, no need for clean routines, defaults to true
 */
export async function closeNotification(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {container, noteElement, notificationId, backgroundElement, removeElementOnClose = true} = paramObj;

  noteElement.style.visibility = 'collapse';

  if (notificationId) {
    const closePrefixKey = await dataUtils.getNotificationConfigKeyValue({key: 'localstorePrefixKey'});
    if(closePrefixKey){
      const idString = `${closePrefixKey}_${notificationId}`;
      localStorage.setItem(idString, '1');
    }
  }

  if (removeElementOnClose) {
    removeNotificationElement({container, noteElement, backgroundElement});
  }
}

/**
 * NOTE! currently only supported by dialog
 *
 * @param {object} paramObj object delivery for function
 * @param {HTMLDivElement} paramObj.backgroundElement element that works as background
 * @param {boolean} paramObj.showBackground should the element be visible and blocking interface
 */
export function setNotificationListBackground(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {backgroundElement, showBackground = false} = paramObj;

  if (!backgroundElement || !backgroundElement.style) {
    //if no element set skipt this option
    throw new Error('Trying to set notification list background but required information is missing');
  }

  backgroundElement.style.visibility = showBackground ? 'visible' : 'hidden';
  backgroundElement.style.pointerEvents = showBackground ? 'unset' : 'auto';
}

/**
 * Show and hide (or just show) automatically with css animation the element
 * Can autoremove elements upon animation end
 *
 * @param {object} paramObj object delivery for function
 * @param {HTMLDivElement} paramObj.container root element holding noteElements
 * @param {HTMLDivElement} paramObj.noteElement root element for visible notification item
 * @param {object} [paramObj.animationInfoObj] optional - object to hold additional information of animation
 * @param {String} [paramObj.animationInfoObj.classIdForAnimationElement] optional - css class for animation, use "show-and-hide" for normal usage and if listenAnimationToEnd: false then only use "show" class
 * @param {boolean} [paramObj.animationInfoObj.listenAnimationToEnd] optional - should we expect to have end animation, use proper class element for setting css animation
 * @param {String} [paramObj.animationInfoObj.animationStartName] optional - animation name for start listener to check up on
 * @param {String} [paramObj.animationInfoObj.animationEndName] optional - animation name for end listener to check up on
 * @param {String} [paramObj.animationInfoObj.animationEndVisibilityStyle] optional - how we hide element after animation ends
 * @param {boolean} [paramObj.animationInfoObj.removeElementOnClose] optional - should the whole element be removed after close, self cleaning, no need for clean routines
 * @param {String} [paramObj.animationInfoObj.onAnimationStart] optional - what to do after animation start
 * @param {String} [paramObj.animationInfoObj.onAnimationEnd] optional - what to do after animation end (by default before this call hides element visibility)
 * @param {HTMLDivElement} [paramObj.backgroundElement] optional - separate background element for content container to be hidden if last element was removed
 * @param {String} [paramObj.notificationId] optional - notification id if provided to record close action
 *
 */
export function displayNotificationWithAnimation(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {container, noteElement, animationInfoObj, backgroundElement, notificationId} = paramObj;

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
  if (animationInfoObj) {
    animationSettingsObject = {...defaultAnimationSettings, ...animationInfoObj};
  }
  const {classIdForAnimationElement, listenAnimationToEnd, animationStartName, animationEndName, animationEndVisibilityStyle, removeElementOnClose, onAnimationStart, onAnimationEnd} = animationSettingsObject;


  //set listeners
  setAnimationStartListener();
  if (listenAnimationToEnd) {
    setAnimationEndListener();
  }

  //add class to autostart required animations
  noteElement.classList.add(classIdForAnimationElement);


  //functions
  function setAnimationStartListener() {
    noteElement.onanimationstart = (event) => {
      if (event.animationName === animationStartName) {
        if (onAnimationStart) {
          onAnimationStart();
        }
      }
    };
  }
  function setAnimationEndListener() {
    noteElement.onanimationend = (event) => {
      if (event.animationName === animationEndName) {
        noteElement.style.visibility = animationEndVisibilityStyle;

        if (onAnimationEnd) {
          onAnimationEnd();
        }

        if (removeElementOnClose) {
          closeNotification({container, noteElement, notificationId, backgroundElement, removeElementOnClose});
        }
      }
    };
  }
}

/**
 * Creates clickable link button element.
 * In order to open external url correctly its format is checked and only absolute format is accepted.
 * IF relative path is required please update
 *
 * Returns undefined object if something goes wrong and if theres no button data
 * if created button is undefined addButton does not set rather it detects it handles it there onward
 *
 * @param {object} paramObj object delivery for function
 * @param {object} paramObj.dataObject data object for holding
 * @param {String} paramObj.dataObject.text visible text for link
 * @param {String} paramObj.dataObject.url link to open
 * @returns {undefined|Element} return undefined if could not create button return button element with url click
 */
export function createLinkButton(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {dataObject} = paramObj;

  if (!dataObject) {
    return undefined;
  }
  const {text, url} = dataObject;
  if (!text || !url) {
    console.warn('Missing data when creating link button');
    return undefined;
  }
  //see if url given is relative or absolute
  //relative ones try to open with pages baseURI. We most likely want here to open external site so we want absolute
  //essentially we want url with http: or https:
  if (!isAbsoluteURL({testUrl: url})) {
    console.warn('Link button url set to relative please check url format');
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
  function isAbsoluteURL(subParamObj) {
    const {testUrl} = subParamObj;
    try {
      //try to construct URL with test string
      new URL(testUrl);
      return true;//absolute
    } catch (error) {
      if (error instanceof TypeError) {
        return false;//relative
      }

      //other error, default to it being relative because it fails out
      console.warn(error);
      return false;
    }
  }
}

/**
 * Construct styled action button to given style
 *
 * Returns undefined object if something goes wrong and if theres no button data
 * if created button is undefined addButton does not set rather it detects it handles it there onward
 *
 * @param {object} paramObj object delivery for function
 * @param {String} paramObj.style What style of notificaiton are we talking about
 * @param {object} paramObj.buttonData data object for holding
 * @param {String} paramObj.buttonData.text visible text
 * @param {CallableFunction} paramObj.buttonData.onClick action on press
 * @param {CallableFunction} [paramObj.afterClick] optional - any cleanup work after click?, mostly internal functionality, defined on ui script
 * @returns {undefined|Element} get button or nothing
 */
export function createActionButton(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {style, buttonData, afterClick} = paramObj;

  //check primary data
  if (!style || !buttonData) {
    return undefined;
  }

  //deconstruct and check data again
  const {text, onClick} = buttonData;

  if (!text || !onClick) {
    console.warn('Action buttons data object is lacking');
    return undefined;
  }

  //create element
  const actionBtn = document.createElement('button');
  //add data to element and return it
  actionBtn.innerHTML = text;
  setClassesForButton(style, actionBtn);
  actionBtn.addEventListener('click', () => {
    onClick();

    //mostly for cleanup job within this script, should not be expected from outside
    if (afterClick) {
      afterClick();
    }
  });
  return actionBtn;

  /**
     * Gets defined css classes for button and sets them in order
     * @param {String} style notification style
     * @param {Element} button action buttons element
     */
  function setClassesForButton(style, button) {
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
  function getClassesForButton(style) {
    const classArray = ['button'];
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

    if (style === 'error') {
      classArray.push('alternate-red');
      return classArray;
    }

    //default to info style
    classArray.push('blue');
    return classArray;
  }
}


//************************************************************************************** */
// Helper functions

/**
 * Remove notification element item from container holding them, if theres a background element for that container check should it be hidden
 *
 * NOTE! NOT the same as closeNotification, this only removes elements and sets background if provided
 * In use cases where notification close action is required use closeNotification as it does more
 *
 * @param {object} paramObj object delivery for function
 * @param {HTMLDivElement} paramObj.container root element holding noteElements
 * @param {HTMLDivElement} paramObj.noteElement root element for visible notification item
 * @param {HTMLDivElement} [paramObj.backgroundElement]  optional - separate background element for content container to be hidden if last element was removed
 */
function removeNotificationElement(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {container, noteElement, backgroundElement} = paramObj;

  removeElementFromContainer({container: container, elementToRemove: noteElement});
  hideBackgroundIfNoActiveChildren({container, backgroundElement});
}

/**
 * Remove element from container. Find child node and remove it
 *
 * @param {object} paramObj
 * @param {HTMLDivElement} paramObj.container - upper level container
 * @param {element} paramObj.elementToRemove - item to remove
 */
function removeElementFromContainer(paramObj){
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {container, elementToRemove} = paramObj;
  if(!container || !elementToRemove){
    throw new Error('Missing data in removeElementFromContainer');
  }

  //test if container itself is element
  if(container === elementToRemove){
    callParentToRemoveChild({elementToRemove: elementToRemove});
    return;
  }

  //go through all child nodes, remove the one matching
  const targetElement = Array.from(container.childNodes).find(childNode => childNode === elementToRemove);
  if(targetElement){
    const parent = targetElement.parentNode;
    if(!parent){
      //no parent (sad), so cant use parent removal
      return;
    }
    parent.removeChild(targetElement);
  }
}

/**
 * Hide notification list background element if no active notifications on the list
 * Show with "setNotificationListBackground" within notification styles show function
 *
 * @param {object} paramObj object delivery for function
 * @param {HTMLDivElement} paramObj.container root element holding noteElements
 * @param {HTMLDivElement} paramObj.backgroundElement separate background element for content container to be hidden if last element was removed
 */
function hideBackgroundIfNoActiveChildren(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {container, backgroundElement} = paramObj;

  //if no element provided ignore this
  if (!container || !backgroundElement) {
    return;
  }

  //if has children visible ignore this
  if (hasActiveChildren()) {
    return;
  }

  setNotificationListBackground({backgroundElement, showBackground: false});

  function hasActiveChildren() {
    const children = Array.from(container.children);
    let isActive = false;

    //theres no breaking out of the foreach... so using helper variable
    //personally I would have preferred for...of
    children.forEach(child => {
      const computedStyle = window.getComputedStyle(child);
      const visibility = computedStyle.getPropertyValue('visibility');

      if (visibility === 'visible') {
        isActive = true;
      }
    });

    return isActive;
  }
}

/**
 *
 * @param {object} paramObj object delivery for function
 * @param {HTMLDivElement} paramObj.noteElement root element for visible notification item
 * @param {String} paramObj.closeButtonId element id for close button
 * @param {boolean} [paramObj.removeContainer=true] should remove whole container
 */
function hideCloseButton(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {noteElement, closeButtonId, removeContainer = true} = paramObj;

  noteElement.querySelector(`.${closeButtonId}`).style.visibility = 'collapse';
  if (removeContainer) {
    const closeButtonContainer = noteElement.querySelector(`.${closeButtonId}`);
    removeElementFromContainer({container: noteElement, elementToRemove: closeButtonContainer});
  }
}

/**
 *
 * @param {object} paramObj object delivery for function
 * @param {HTMLDivElement} paramObj.container root element holding noteElements
 * @param {HTMLDivElement} paramObj.noteElement root element for visible notification item
 * @param {String} paramObj.closeButtonId element id for close button
 * @param {String} [paramObj.notificationId] optional - notification id if provided to record close action
 * @param {boolean} [paramObj.removeElementOnClose=true] optional - should the whole element be removed after close, self cleaning, no need for clean routines
 * @param {HTMLDivElement} [paramObj.backgroundElement] optional - separate background element for content container to be hidden if last element was removed
 */
function addCloseButton(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {container, noteElement, closeButtonId, notificationId, removeElementOnClose = true, backgroundElement} = paramObj;

  noteElement.querySelector(`.${closeButtonId}`).addEventListener('click', (event) => {
    eventHandled(event);
    closeNotification({container, noteElement, notificationId, backgroundElement, removeElementOnClose});
  });
}

/**
 * @param {object} paramObj object delivery for function
 * @param {String} paramObj.style notification style
 * @returns {String} default title conttent
 */
function getDefaultTitleText(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {style} = paramObj;

  if (style === 'info') {
    return 'Huomasithan';
  } else if (style === 'success') {
    return 'Onnistui';
  } else if (style === 'alert') {
    return 'Huomio';
  } else if (style === 'error') {
    return 'Virhe';
  }

  return 'Tuntematon';
}

/**
 * @param {object} paramObj object delivery for function
 * @param {String} paramObj.style notification style (info/alert etc.) based visible stylings
 */
function getNotificationColoursAndIconsWithStyle(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {style} = paramObj;

  if (style === 'success') {
    return {
      bg: 'var(--color-green-80)',
      iconBg: 'var(--color-green-100)',
      icon: 'check_circle_outline'
    };
  } else if (style === 'alert') {
    return {
      bg: 'var(--color-yellow-80)',
      iconBg: 'var(--color-blue-100)',
      icon: 'warning_amber'
    };
  } else if (style === 'error') {
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
