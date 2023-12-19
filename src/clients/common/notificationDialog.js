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
 * @param {*} notifiations array of notifications
 * @param {*} isStatic should dialog fade out
 * @param {*} isBlocking can user close the dialog
 */
export function showNotificationDialogs(notifiations, isStatic = true, isBlocking = false, showBackground = false){
  setBackground(showBackground, showBackground);
  for (const notification of notifiations) {
    showNotificationDialog({style: notification.type, text: notification.message}, isStatic, isBlocking);
  }

  function setBackground(showBackground = true, blockInteractions = false){
    const backgroundElement = document.getElementById('notificationDialogsBg');
    backgroundElement.style.visibility = showBackground ? 'visible' : 'hidden';
    backgroundElement.style.pointerEvents = blockInteractions ? 'unset' : 'auto';
  }
}

/**
 * 
 * @param {*} notificationDialogContent object
 * @param {*} notificationDialogContent.type info/success/alert/error
 * @param {*} notificationDialogContent.message given message
 * @param {*} isStatic should dialog fade out ?
 * @param {*} blockInteractions show close dialog ?
 * @returns 
 */
export function showNotificationDialog(notificationDialogContent, isStatic = true, blockInteractions = false) {

  if (arguments.length === 0 || notificationDialogContent === null) {
    console.log('NotificationDialog needs arguments');
    return;
  }

  getNotificationDialogHtml()
    .then(html => createNotificationDialog(notificationDialogContent, html, isStatic, blockInteractions))
    .catch(error => console.log('Error while fetching notificationDialog html: ', error));
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

function createNotificationDialog(notificationDialogContent, html, isStatic = true, blockInteractions = false) {
  const notificationDialogElement = getNewNotificationDialog(html);

  const notificationDialogType = checkNotificationDialogType(notificationDialogContent);

  switch (true) {
    case notificationDialogType === 'string':
      createDefaultNotificationDialog(notificationDialogContent);
      break;
    case notificationDialogType === 'object':
      createCustomNotificationDialog(notificationDialogContent);
      break;
    default:
      console.log('NotificationDialog argument type should be string or object');
      return;
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
    if(blockInteractions){
      notificationDialogElement.querySelector(`.notificationdialog-close`).style.visibility = 'hidden';
    }
    else{
      addCloseButton();
    }

    function setNotificationDialogStyle() {

      // style 'info' is the default status message
      // notificationDialog has blue background with info icon
      let backgroundColor = 'var(--color-blue-60)';
      let iconColor = 'var(--color-blue-100)';
      let icon = 'error_outline';


      if (style === 'success') {
        backgroundColor = 'var(--color-green-80)';
        iconColor = 'var(--color-green-100)';
        icon = 'check_circle_outline';
      }

      if (style === 'alert') {
        backgroundColor = 'var(--color-yellow-80)';
        iconColor = 'var(--color-blue-100)';
        icon = 'warning_amber';
      }

      if (style === 'error') {
        backgroundColor = 'var(--color-red-80)';
        iconColor = 'var(--color-red-100)';
        icon = 'report_gmailerrorred';
      }

      notificationDialogElement.style.setProperty(`--style-background-color`, backgroundColor);
      notificationDialogElement.style.setProperty(`--style-icon-color`, iconColor);
      notificationDialogElement.querySelector(`.notificationdialog-icon .material-icons`).innerHTML = icon;

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

  function addCloseButton() {
    notificationDialogElement.querySelector(`.notificationdialog-close`).addEventListener('click', (event) => {
      eventHandled(event);
      notificationDialogElement.style.visibility = 'hidden';

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
          notificationDialog.style.visibility = 'hidden';
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
