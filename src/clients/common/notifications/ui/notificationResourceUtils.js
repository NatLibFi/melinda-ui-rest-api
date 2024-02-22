import {getFromCache} from '/../common/cacheService.js';

//************************************************************************************** */
// Resource helper functions for notificationManager.js, meant for getting required root resources from the files

/**
 * Function for loading container (where to put notifications) and notification document (what to put) data
 *
 * @param {object} paramObj object delivery for function
 * @param {object} paramObj.componentInquiryData to simplify functioncall
 * @param {String} paramObj.componentInquiryData.componentStyle notifications component style, for logging
 * @param {String} paramObj.componentInquiryData.templateId html files template to fetch
 * @param {String} paramObj.componentInquiryData.elementId element withing template
 * @param {String} paramObj.componentInquiryData.containerId container within document to put elements into
 * @throws {Error} if at any point getting container and noteElement throws error
 * @returns {Promise}
 */
export async function getRequiredComponentData(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {componentInquiryData} = paramObj;
  const {componentStyle, templateId, elementId, containerId} = componentInquiryData;

  try {
    const noteElement = await getNotificationElement({templateId, elementId});
    const container = getContainerForNotifications({containerId});
    return [container, noteElement];
  } catch (error) {
    console.error(`Error in getting component data for ${componentStyle}`);
    throw new Error(error);
  }
}

//************************************************************************************** */
// Helper functions

/**
 *
 * Get notification html element from html files correct template
 *
 * @param {object} paramObj object delivery for function
 * @param {String} paramObj.templateId to get template with id from html file
 * @param {String} paramObj.elementId to get element with id from template
 * @throws {Error} if no html document or root element is found, also if rootelement does not get argumens or error happens on the process
 * @returns {Promise} returns html document and if no html found throws error
 */
async function getNotificationElement(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {templateId, elementId} = paramObj;

  try {
    const html = await getHtml('/../common/notifications/ui/notification.html', 'notificationHtmlTemplates');
      const doc = getElementRootDocument(html, templateId, elementId);
      if (!doc) {
        throw new Error('No document from html');
      }
      return doc;
  } catch (error) {
    console.error('Error while fetching html: ', error);
    throw new Error(error);
  }

  async function getHtml(path, cacheKey) {
    try {
        const html = await getFromCache({
          key: cacheKey,
          onNewDataRequired: () => fetch(path).then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
          })
        });

        if(!html){
          throw new Error('No html file found');
        }

        return html;

    } catch (error) {
      throw new Error(error);
    }
  }
  //get template from document, and from template get spesific element root div
  function getElementRootDocument(html, templateId, elementId) {

    if (arguments.length === 0 || !html || !templateId || !elementId) {
      throw new Error('getElementRootDocument needs arguments');
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const template = doc.getElementById(templateId);
    const fragment = template.content.cloneNode(true);
    const element = fragment.getElementById(elementId);

    if (!element) {
      throw new Error('No element found from html');
    }

    return element;
  }
}

/**
 * Get container where to put new htlm element to, add/look for "notifications"
 *
 * If no container is found throw error since usage should be within getNotificationElement implementation and its error catcher should pick it up
 *
 * @param {object} paramObj object delivery for function
 * @param {String} paramObj.containerId if for container holding all notification elements
 * @throws {Error} of we did not find container where to put notifications
 * @returns {HTMLDivElement}
 */
function getContainerForNotifications(paramObj) {
  if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
    throw new Error('Malformed or missing param object on function');
  }
  const {containerId} = paramObj;

  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`No container for notification ${containerId}`);
  }

  return container;
}
