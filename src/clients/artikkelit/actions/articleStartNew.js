import {showFormActionsOnEdit} from '/artikkelit/actions/articleModes.js';
import {showNotificationBanner} from '/common/ui-utils.js';


/*****************************************************************************/
/* START NEW RECORD ACTIONS                                                  */
/*****************************************************************************/

//---------------------------------------------------------------------------//
// Function for clearing all form fields
// and starting new article record from an empty form
window.startNewEmptyForm = function (event = undefined) {
  console.log('Start new record with empty form')
  eventHandled(event);

  showFormActionsOnEdit();
  showArticleFormEditMode();
  clearAllFields();
  showNotificationBanner({style: 'info', text: 'Aloitetaan uusi kuvailu tyhjältä pohjalta'})
}

//---------------------------------------------------------------------------//
// Function for copying the saved record
// and starting new article record with prefilled form fields
window.startNewCopyForm = function (event = undefined) {
  console.log('Start new record with copied form')
  eventHandled(event);

  //TODO
}

