
/**
 * In a same:ish way the notification banner and dialogs are handled push child to a container except here make sure theres only one child (for now)
 */
/**
 * 
 * @param {*} content we are expecting object with a "style" and "message"
 * @returns 
 */
export function showNotificationBannerStatic(content) {

  if (arguments.length === 0 || content === null) {
    console.log('NotificationBannerStatic needs arguments');
    return;
  }
  if(!content || !content.style || !content.text){
    console.log('showNotificationBannerStatic argument needs to have object with correct fields, see JSDoc comment');
    return;
  }

  getNotificationBannerStaticHtml()
    .then(html => createNotificationBannerStatic(content, html))
    .catch(error => console.log('Error while fetching NotificationBannerStatic html: ', error));
}

async function getNotificationBannerStaticHtml() {
  const response = await fetch('/../common/templates/notificationBannerStatic.html');
  const html = await response.text();
  return html;
}

function createNotificationBannerStatic(content, html) {
  const templateElement = getNewNotificationBannerStatic(html);
  
  styleBasedOnType();
  addTextToElement();
  addElementToContainer();

  //************************************************************************************** */
  // Helper functions for createNotificationBannerStatic:

  function getNewNotificationBannerStatic(html) {
    const NotificationBannerStaticDocument = getNotificationBannerStaticDocument();
    const NotificationBannerStaticTemplate = NotificationBannerStaticDocument.getElementById('notificationBannerStaticTemplate');
    const NotificationBannerStaticFragment = NotificationBannerStaticTemplate.content.cloneNode(true);
    const NotificationBannerStaticElement = NotificationBannerStaticFragment.getElementById('notificationBannerStatic');
    return NotificationBannerStaticElement;

    function getNotificationBannerStaticDocument() {
      const parser = new DOMParser();
      const NotificationBannerStaticDocument = parser.parseFromString(html, 'text/html');
      return NotificationBannerStaticDocument;
    }

  }
  function styleBasedOnType(){
    const styleObj = getColorsAndIconWithStyle(content.style);

    const container = document.getElementById('notificationStaticBanner');
    container.style.setProperty(`--style-background-color`, styleObj.bg);
    templateElement.style.setProperty(`--style-icon-color`, styleObj.iconBg);
    templateElement.querySelector(`.notificationbannerstatic-icon .material-icons`).innerHTML = styleObj.icon;
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

  function addTextToElement(){
    templateElement.querySelector(`.notificationbannerstatic-text`).innerHTML = content.text;
  }

  //keep single child element
  function addElementToContainer() {
    const container = document.getElementById('notificationStaticBanner');
    container.replaceChildren();//only keep one item, TODO: support more ?
    container.prepend(templateElement);
  }
}
