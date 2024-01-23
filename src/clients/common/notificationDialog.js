// ************************************************************************************** /
// ************************************************************************************** /
// ************************************************************************************** /
// Notification dialog
//
// Function for showing messages for user
//
// Use:
// - import showNotificationDialog to your app js from ui-utils
// - add empty div element to your app html with id 'notificationDialogs' and class "notificationDialogs"
// - call function with a string to create default notificationDialog or with a object parameter to create custom notificationDialog
//
// A: Default notificationDialog
//    * notification dialog that is shown on top of the page to the user
//    * contains just your message as string with default style 'info' and button for closing notificationDialog.
//    * if your message text is long, you can use <br> to create line breaks.
//    => showNotificationDialog(string)
//    => example: showNotificationDialog('This is my message')
//
// B: Custom notificationDialog
//    * notification dialog that is shown on top of the page to the user
//    * currently the options for custom notificationDialog are
//       - style (as string) => the style of messagge, one of the following: info, success, alert, error
//       - text (as string) => the message for user
//       - linkButton (as <button> element) => if the user can do some extra action
//    => showNotificationDialog({style: string, text: string, linkButton: <button>})
//    => example: showNotificationDialog({style: 'alert', text: 'This is my warning message', linkButton: myLinkButton})
//        - note for linkButton:
//            1. create a button element in app
//                  => example: const myLinkButton = document.createElement('button')
//            2. add button text as innerHtml
//                  => example: myLinkButton.innerHtml = 'open link or do some action'
//            3. add listener for 'click' events to include the chosen action for snacbar
//                  => example: myLinkButton.addEventListener('click', function (event) {eventHandled(event); ...my action code here... });

/**
 * 
 * @param {*} notificationDialogContent object
 * @param {*} notificationDialogContent.id id of dataobject if any
 * @param {*} notificationDialogContent.style info/success/alert/error
 * @param {*} notificationDialogContent.text given text
 * @param {*} isStatic should dialog fade out ?
 * @param {*} canDismiss show close dialog button ?
 * @param {*} showBackground show semi transparent backgroudn blocking layer
 * @returns 
 */
export function showNotificationDialog(notificationDialogContent, isStatic = true, canDismiss = false, showBackground = false) {

  if (arguments.length === 0 || notificationDialogContent === null) {
    console.log('NotificationDialog needs arguments');
    return;
  }
  
  //for now if we enable the background expect it to be needed to blocking elements under it also
  setNotificationDialogListBackground(showBackground, showBackground);

  getNotificationDialogHtml()
    .then(html => createNotificationDialog(notificationDialogContent, html, isStatic, canDismiss))
    .catch(error => console.log('Error while fetching notificationDialog html: ', error));
}

/**
 * 
 * @param {*} showBackground should the background element be visible
 * @param {*} blockBackground should the background element prevent actions through it
 */
function setNotificationDialogListBackground(showBackground = true, blockBackground = false){
  const backgroundElement = document.getElementById('notificationDialogsBg');
  backgroundElement.style.visibility = showBackground ? 'visible' : 'hidden';
  backgroundElement.style.pointerEvents = blockBackground ? 'unset' : 'auto';
}


// ************************************************************************************** //
// ************************************************************************************** //
// Fetch notificationDialog.html containing the template for one notificationDialog


async function getNotificationDialogHtml() {
  const response = await fetch('/../common/templates/notificationDialog.html');
  const html = await response.text();
  return html;
}


// ************************************************************************************** //
// ************************************************************************************** //
// Creates new notificationDialog with given properties and add it to app's html.
//
// First clones notificationDialog template content to create a new notificationDialog element,
// then modifies notificationDialog element according to arguments given in parameter notificationDialogContent.
// After that, queries the calling app's html for div element with id 'notificationDialogs',
// and adds the notificationDialog element to the element as first element.
// Also, clears the notificationDialogs div from all notificationDialog elements after the (last) notificationDialog has displayed.


let timeoutId = null;

function createNotificationDialog(notificationDialogContent, html, isStatic = true, canDismiss = false) {
  const notificationDialogElement = getNewNotificationDialog(html);

  const notificationDialogType = checkNotificationDialogType(notificationDialogContent);

  const isString = notificationBannerType === 'string';
  const isObject = notificationBannerType === 'object';
  const isValidType = isString || isObject;

  if(!isValidType){
    console.log('NotificationDialog argument type should be string or object');
    return;
  }  
  
  if(isString){
    createDefaultNotificationDialog(notificationBannerContent);
  }
  else if(isObject){
    createCustomNotificationDialog(notificationBannerContent);
  }

  const text = notificationDialogElement.querySelector(`.notificationdialog-text`).innerHTML;
  if (text === 'undefined' || text === '') {
    console.log('NotificationDialog is missing text and is not displayed!');
    return;
  }

  addNotificationDialog();
  displayNotificationDialog(isStatic);
  if(!isStatic)
    clearNotificationDialogs();


  //************************************************************************************** */
  // Helper functions for createNotificationDialog:

  function getNewNotificationDialog(html) {
    const notificationDialogDocument = getNotificationDialogDocument();
    const notificationDialogTemplate = notificationDialogDocument.getElementById('notificationDialogTemplate');
    const notificationDialogFragment = notificationDialogTemplate.content.cloneNode(true);
    const notificationDialogElement = notificationDialogFragment.getElementById('notificationDialog');
    return notificationDialogElement;

    function getNotificationDialogDocument() {
      const parser = new DOMParser();
      const notificationDialogDocument = parser.parseFromString(html, 'text/html');
      return notificationDialogDocument;
    }

  }

  function checkNotificationDialogType() {

    if (typeof notificationDialogContent === 'string' || notificationDialogContent instanceof String) {
      return 'string';
    }

    if (typeof notificationDialogContent === 'object' && Object.keys(notificationDialogContent).length !== 0 && Object.getPrototypeOf(notificationDialogContent) === Object.prototype) {
      return 'object';
    }
  }

  function createDefaultNotificationDialog(notificationDialogString) {
    createCustomNotificationDialog({text: notificationDialogString});
  }

  function createCustomNotificationDialog(notificationDialogObject) {
    const {style, text, linkButton, title} = notificationDialogObject;

    setNotificationDialogStyle();
    addTextToNotificationDialog(text);
    addLinkButton();

    //if title is provided use that but if not use default
    if(title){notificationDialogElement.querySelector(`.notificationdialog-title`).innerHTML = titleText;}
    else{
      addDefaultStyleBasedTitle();
    }
    //close button can be optional
    if(canDismiss){
      notificationDialogElement.querySelector(`.notificationdialog-close`).style.visibility = 'hidden';
    }
    else{
      addCloseButton(notificationDialogObject);
    }

    function setNotificationDialogStyle() {
      const styleObj = getColorsAndIconWithStyle(style);

      notificationDialogElement.style.setProperty(`--style-background-color`, styleObj.bg);
      notificationDialogElement.style.setProperty(`--style-icon-color`, styleObj.iconBg);
      notificationDialogElement.querySelector(`.notificationdialog-icon .material-icons`).innerHTML = styleObj.icon;

    }
    
    function getColorsAndIconWithStyle(style){

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
      // notificationBanner has blue background with info icon
      return {
        bg: 'var(--color-blue-60)',
        iconBg: 'var(--color-blue-100)',
        icon: 'error_outline'
      };
    }

    function addLinkButton() {
      if (linkButton !== undefined && linkButton.nodeName === 'BUTTON') {
        notificationDialogElement.querySelector(`.notificationdialog-link`).style.display = 'flex';
        notificationDialogElement.querySelector(`.notificationdialog-link`).append(linkButton);
      }
    }

    function addDefaultStyleBasedTitle(){
      let titleText = '';
      switch (style) {
        default:
        case 'info':
          titleText = 'Huomasithan';
          break;
        case 'success':
          titleText = 'Onnistui';
        break;
        case 'alert':
          titleText = 'Huomio';
        break;
        case 'error':
          titleText = 'Virhe';
        break;
      }
      notificationDialogElement.querySelector(`.notificationdialog-title`).innerHTML = titleText;
    }
  }

  function addTextToNotificationDialog(text) {
    notificationDialogElement.querySelector(`.notificationdialog-text`).innerHTML = text;
  }

  function addCloseButton(notificationData) {
    notificationDialogElement.querySelector(`.notificationdialog-close`).addEventListener('click', (event) => {
      eventHandled(event);
      notificationDialogElement.style.visibility = 'collapse';

      //TODO: update what to specify unique data instance
      if(notificationData.id){
        const idString = `notification_${notificationData.id}`;
        localStorage.setItem(idString, '1');
      }

      //in case there are blocking dialogs that have userinteraction enabled
      //check if there is any visible dialogs after closing one return the background normal
      if(!hasActiveChildren()){
        hideBackground();
      }
      
      function hasActiveChildren(){
        const notificationDialogsContainer = document.getElementById('notificationDialogs');
        const children = notificationDialogsContainer.children;
        for (const child of children) {
          if(child.style.visibility === 'visible'){
            return true;
          }
        }
        return false;
      }
      function hideBackground(){
        const backgroundElement = document.getElementById('notificationDialogsBg');
        backgroundElement.style.visibility = 'hidden';
      }
    });
  }

  function addNotificationDialog() {
    const notificationDialogsContainer = document.getElementById('notificationDialogs');
    notificationDialogsContainer.prepend(notificationDialogElement);
  }

  function displayNotificationDialog(isStatic = true) {
    const notificationDialog = document.querySelector('#notificationDialog');

    listenToNotificationDialogAnimationStart();
    listenToNotificationDialogAnimationEnd();
    if(isStatic){
        notificationDialog.classList.add('show');
    }else{
        notificationDialog.classList.add('show-and-hide');
    }

    function listenToNotificationDialogAnimationStart() {
      notificationDialog.onanimationstart = (event) => {
        if (event.animationName === 'fadein') {
          //console.log('Now showing notificationDialog to user!');
        }
      };
    }

    function listenToNotificationDialogAnimationEnd() {
      notificationDialog.onanimationend = (event) => {
        if (event.animationName === 'fadeout') {
          notificationDialog.style.visibility = 'collapse';
        }
      };
    }

  }

  function clearNotificationDialogs() {
    clearTimeout(timeoutId);

    // This should be accurate enough for most use cases
    timeoutId = setTimeout(() => {
      removeAllNotificationDialogElements();
    }, 7000);

    function removeAllNotificationDialogElements() {
      const notificationDialogsContainer = document.getElementById('notificationDialogs');
      notificationDialogsContainer.replaceChildren();
    }

  }

}
