// ************************************************************************************** /
// ************************************************************************************** /
// ************************************************************************************** /
// Notification banner
//
// Function for showing messages for user
//
// Use:
// - import showNotificationBanner to your app js from ui-utils
// - add empty div element to your app html with id 'notificationBanners' and class "notificationBanners"
// - call function with a string to create default notificationBanner or with a object parameter to create custom notificationBanner
//
// A: Default notificationBanner
//    * notification banner that is shown on top of the page to the user
//    * contains just your message as string with default style 'info' and button for closing notificationBanner.
//    * if your message text is long, you can use <br> to create line breaks.
//    => showNotificationBanner(string)
//    => example: showNotificationBanner('This is my message')
//
// B: Custom notificationBanner
//    * notification banner that is shown on top of the page to the user
//    * currently the options for custom notificationBanner are
//       - style (as string) => the style of messagge, one of the following: info, success, alert, error
//       - text (as string) => the message for user
//       - linkButton (as <button> element) => if the user can do some extra action
//    => showNotificationBanner({style: string, text: string, linkButton: <button>})
//    => example: showNotificationBanner({style: 'alert', text: 'This is my warning message', linkButton: myLinkButton})
//        - note for linkButton:
//            1. create a button element in app
//                  => example: const myLinkButton = document.createElement('button')
//            2. add button text as innerHtml
//                  => example: myLinkButton.innerHtml = 'open link or do some action'
//            3. add listener for 'click' events to include the chosen action for snacbar
//                  => example: myLinkButton.addEventListener('click', function (event) {eventHandled(event); ...my action code here... });


export function showNotificationBanner(notificationBannerContent) {

  if (arguments.length === 0 || notificationBannerContent === null) {
    console.log('NotificationBanner needs arguments');
    return;
  }

  getNotificationBannerHtml()
    .then(html => createNotificationBanner(notificationBannerContent, html))
    .catch(error => console.log('Error while fetching notificationBanner html: ', error));
}


// ************************************************************************************** //
// ************************************************************************************** //
// Fetch notificationBanner.html containing the template for one notificationBanner


async function getNotificationBannerHtml() {
  const response = await fetch('/../common/templates/notificationBanner.html');
  const html = await response.text();
  return html;
}


// ************************************************************************************** //
// ************************************************************************************** //
// Creates new notificationBanner with given properties and add it to app's html.
//
// First clones notificationBanner template content to create a new notificationBanner element,
// then modifies notificationBanner element according to arguments given in parameter notificationBannerContent.
// After that, queries the calling app's html for div element with id 'notificationBanners',
// and adds the notificationBanner element to the element as first element.
// Also, clears the notificationBanners div from all notificationBanner elements after the (last) notificationBanner has displayed.


let timeoutId = null;

function createNotificationBanner(notificationBannerContent, html) {
  const notificationBannerElement = getNewNotificationBanner(html);

  const notificationBannerType = checkNotificationBannerType(notificationBannerContent);

  const isString = notificationBannerType === 'string';
  const isObject = notificationBannerType === 'object';
  const isValidType = isString || isObject;

  if(!isValidType){
    console.log('NotificationBanner argument type should be string or object');
    return;
  }  
  
  if(isString){
    createDefaultNotificationBanner(notificationBannerContent);
  }
  else if(isObject){
    createCustomNotificationBanner(notificationBannerContent);
  }

  const text = notificationBannerElement.querySelector(`.notificationbanner-text`).innerHTML;
  if (text === 'undefined' || text === '') {
    console.log('NotificationBanner is missing text and is not displayed!');
    return;
  }

  addNotificationBanner();
  displayNotificationBanner();
  clearNotificationBanners();


  //************************************************************************************** */
  // Helper functions for createNotificationBanner:

  function getNewNotificationBanner(html) {
    const notificationBannerDocument = getNotificationBannerDocument();
    const notificationBannerTemplate = notificationBannerDocument.getElementById('notificationBannerTemplate');
    const notificationBannerFragment = notificationBannerTemplate.content.cloneNode(true);
    const notificationBannerElement = notificationBannerFragment.getElementById('notificationBanner');
    return notificationBannerElement;

    function getNotificationBannerDocument() {
      const parser = new DOMParser();
      const notificationBannerDocument = parser.parseFromString(html, 'text/html');
      return notificationBannerDocument;
    }

  }

  function checkNotificationBannerType() {

    if (typeof notificationBannerContent === 'string' || notificationBannerContent instanceof String) {
      return 'string';
    }

    if (typeof notificationBannerContent === 'object' && Object.keys(notificationBannerContent).length !== 0 && Object.getPrototypeOf(notificationBannerContent) === Object.prototype) {
      return 'object';
    }
  }

  function createDefaultNotificationBanner(notificationBannerString) {
    createCustomNotificationBanner({text: notificationBannerString});
  }

  function createCustomNotificationBanner(notificationBannerObject) {
    const {style, text, linkButton} = notificationBannerObject;

    setNotificationBannerStyle();
    addTextToNotificationBanner(text);
    addLinkButton();
    addCloseButton(notificationBannerObject);

    function setNotificationBannerStyle() {

      // style 'info' is the default status message
      // notificationBanner has blue background with info icon
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

      notificationBannerElement.style.setProperty(`--style-background-color`, backgroundColor);
      notificationBannerElement.style.setProperty(`--style-icon-color`, iconColor);
      notificationBannerElement.querySelector(`.notificationbanner-icon .material-icons`).innerHTML = icon;

    }

    function addLinkButton() {
      if (linkButton !== undefined && linkButton.nodeName === 'BUTTON') {
        notificationBannerElement.querySelector(`.notificationbanner-link`).style.display = 'flex';
        notificationBannerElement.querySelector(`.notificationbanner-link`).append(linkButton);
      }
    }

  }

  function addTextToNotificationBanner(text) {
    notificationBannerElement.querySelector(`.notificationbanner-text`).innerHTML = text;
  }

  function addCloseButton(notificationData) {
    notificationBannerElement.querySelector(`.notificationbanner-close`).addEventListener('click', (event) => {
      eventHandled(event);
      notificationBannerElement.style.visibility = 'collapse';

       //TODO: update what to specify unique data instance
       if(notificationData.id){
        const idString = `notification_${notificationData.id}`;
        localStorage.setItem(idString, '1');
      }
    });
  }

  function addNotificationBanner() {
    const notificationBannersContainer = document.getElementById('notificationBanners');
    notificationBannersContainer.prepend(notificationBannerElement);
  }

  function displayNotificationBanner() {
    const notificationBanner = document.querySelector('#notificationBanner');

    listenToNotificationBannerAnimationStart();
    listenToNotificationBannerAnimationEnd();

    notificationBanner.classList.add('show-and-hide');

    function listenToNotificationBannerAnimationStart() {
      notificationBanner.onanimationstart = (event) => {
        if (event.animationName === 'fadein') {
          //console.log('Now showing notificationBanner to user!');
        }
      };
    }

    function listenToNotificationBannerAnimationEnd() {
      notificationBanner.onanimationend = (event) => {
        if (event.animationName === 'fadeout') {
          notificationBanner.style.visibility = 'collapse';
        }
      };
    }

  }

  function clearNotificationBanners() {
    clearTimeout(timeoutId);

    // This should be accurate enough for most use cases
    timeoutId = setTimeout(() => {
      removeAllNotificationBannerElements();
    }, 7000);

    function removeAllNotificationBannerElements() {
      const notificationBannersContainer = document.getElementById('notificationBanners');
      notificationBannersContainer.replaceChildren();
    }

  }

}
