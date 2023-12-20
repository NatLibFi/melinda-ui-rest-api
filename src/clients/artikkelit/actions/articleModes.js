import {checkArticleForm} from '/artikkelit/actions/articleCheck.js';
import {collectRawFormData} from '/artikkelit/actions/articleCollectFormData.js';
import {disableElement, enableElement, getAllDescendants, isHidden, isVisible} from '/common/ui-utils.js';



/*****************************************************************************/
/* MODES FOR ARTICLE FORM                                                    */
/*****************************************************************************/
// TODO: after article form's html structure update is finished, 
// refactor and update these temporary functions 


//---------------------------------------------------------------------------//
// Function for displaying form in 'locked' read mode
// Hides all edit fields and buttons from view
window.showArticleFormReadMode = function (event = undefined) {
  console.log('Showing article form in read mode');
  eventHandled(event);

  const fieldsets = document.querySelectorAll('#artikkelit #articleForm #fieldsets fieldset');
  const showReadModeButton = document.getElementById('formReadMode');
  const showEditModeButton = document.getElementById('formEditMode');
  const clearFormButton = document.getElementById('formClear');
  const formInfo = document.getElementById('formInfo');

  const formData = collectRawFormData();

  fillPreview(formData);
  enableElement(showEditModeButton);
  disableElement(showReadModeButton);
  disableElement(clearFormButton);

  formInfo.setAttribute('title', 'Lomakkeella näytetään nyt kentät, joihin olet lisännyt tietoja.')

  fieldsets.forEach((fieldset) => {
    for (const child of fieldset.children) {

      if (isVisible(child)) {
        handleVisible(child);
      }

      if (isHidden(child)) {
        handleHidden(child);

      }
    }
  })

  // function that takes the collected form data
  // and sets it for preview in read mode (edit off)
  function fillPreview(formData) {
    fill(formData.journalNumber?.publishingYear, 'yearPreview');
    fill(formData.journalNumber?.volume, 'volPreview');
    fill(formData.journalNumber?.number, 'numberPreview');
    fill(formData.journalNumber?.pages, 'pagesPreview');
    fill(formData.article?.title, 'titlePreview');
    fill(formData.article?.language.ui, 'languagePreview');
    fill(formData.article?.link, 'linkPreview');
    fill(formData.article?.type, 'typePreview');
    fill(formData.article?.sectionOrColumn, 'sectionPreview');
    fill(formData.article?.ccLicense, 'licensePreview');
    fill(formData.collecting?.f589a, 'f589aPreview');
    fill(formData.collecting?.f599a, 'f599aPreview');
    fill(formData.collecting?.f599x, 'f599xPreview');

    function fill(data, elementId) {
      document.getElementById(elementId).innerHTML = data ? data : '';
    }

  }


  // function that handles the elements
  // that are currently visible in form (in edit mode)
  function handleVisible(element) {
    if (element.classList.contains('fieldset-preview')) {
      hideButtons(element);
      return;
    }

    element.style.display = 'none';
    element.classList.add('hidden-in-read-mode');

    function hideButtons(element) {
      getAllDescendants(element).forEach((descendant) => {
        if (descendant.tagName === 'BUTTON') {
          descendant.style.visibility = 'hidden';
          descendant.classList.add('hidden-in-read-mode');
        }
      });
    }
  }

  // function that handles the elements
  // that are currently not visible in the form (in edit mode)
  function handleHidden(element) {
    if (element.classList.contains('hidden-in-edit-mode')) {

      if (element.classList.contains('fieldset-sub-heading')) {
        element.style.display = 'flex';
      }

      for (const child of element.children) {
        if (child.classList.contains('preview-value') && child.innerHTML !== '') {
          element.style.display = 'flex';
        }
      }
    }
  }

}

//---------------------------------------------------------------------------//
// Function for displaying form edit mode, ehich is the default mode of form
// makes the elements that were hidden on read mode visible again
window.showArticleFormEditMode = function (event = undefined) {
  console.log('Showing article form in edit mode');
  eventHandled(event);

  const fieldsets = document.querySelectorAll('#artikkelit #articleForm #fieldsets fieldset');
  const showReadModeButton = document.getElementById('formReadMode');
  const showEditModeButton = document.getElementById('formEditMode');
  const clearFormButton = document.getElementById('formClear');
  const formInfo = document.getElementById('formInfo');

  enableElement(showReadModeButton);
  disableElement(showEditModeButton);
  enableElement(clearFormButton);
  formInfo.setAttribute('title', 'Lomakkeelle lisäämäsi tiedot päivittyvät samalla myös tietueen esikatseluun.')

  fieldsets.forEach((fieldset) => {
    for (const child of fieldset.children) {

      showButtons(child);

      if (child.classList.contains('hidden-in-read-mode')) {
        child.style.display = 'flex';
        child.classList.remove('hidden-in-read-mode');
      }

      if (child.classList.contains('hidden-in-edit-mode')) {
        child.style.display = 'none';
      }
    }

    function showButtons(element) {
      getAllDescendants(element).forEach((descendant) => {
        if (descendant.tagName === 'BUTTON' && descendant.classList.contains('hidden-in-read-mode')) {
          descendant.style.visibility = 'visible';
          descendant.classList.remove('hidden-in-read-mode');
        }
      })
    }
  })

  checkArticleForm();
}

//---------------------------------------------------------------------------//
// Function for making set of buttons in form toolbar visible,
// when form is still editable
export function showFormActionsOnEdit() {
  const divActionsAfterSave = document.getElementById('actionsAfterSave');
  const newEmptyRecordButton = document.getElementById('emptyRecord');
  //const newCopyRecordButton = document.getElementById('copyRecord');

  const divActionsOnEdit = document.getElementById('actionsOnEdit');
  const showEditModeButton = document.getElementById('formEditMode');
  const showReadModeButton = document.getElementById('formReadMode');
  const clearFormButton = document.getElementById('formClear');

  const formNotes = document.getElementById('articleFormNotes');

  disableElement(newEmptyRecordButton);
  //disableElement(newCopyRecordButton);
  divActionsAfterSave.style.display = 'none';

  disableElement(showEditModeButton);
  enableElement(showReadModeButton);
  enableElement(clearFormButton);
  divActionsOnEdit.style.display = 'flex'

  formNotes.classList.remove('record-valid');
}

//---------------------------------------------------------------------------//
// Function for making set of buttons in form toolbar visible
// when form is locked and the record is saved
export function showFormActionsAfterSave() {
  const divActionsOnEdit = document.getElementById('actionsOnEdit');
  const showEditModeButton = document.getElementById('formEditMode');
  const showReadModeButton = document.getElementById('formReadMode');
  const clearFormButton = document.getElementById('formClear');
  const formInfo = document.getElementById('formInfo');

  const divActionsAfterSave = document.getElementById('actionsAfterSave');
  const newEmptyRecordButton = document.getElementById('emptyRecord');
  //const newCopyRecordButton = document.getElementById('copyRecord');

  const formNotes = document.getElementById('articleFormNotes');

  disableElement(showEditModeButton);
  disableElement(showReadModeButton);
  disableElement(clearFormButton);
  formInfo.setAttribute('title', 'Lomakkeen ja tietueen esikatselussa näytetään tallennettu artikkeli.')

  divActionsOnEdit.style.display = 'none';

  enableElement(newEmptyRecordButton);
  //enableElement(newCopyRecordButton);
  divActionsAfterSave.style.display = 'flex';

  formNotes.innerHTML = 'Aloita uusi kuvailu tyhjältä lomakkeelta tai käytä nykyistä lomaketta pohjana.';
  formNotes.classList.add('record-valid');
}



/*****************************************************************************/
/* MODES FOR ARTICLE RECORD                                                  */
/*****************************************************************************/

//---------------------------------------------------------------------------//
// Function for making set of buttons in form toolbar disabled
// when form is locked and the record is saved
export function showRecordActionsAfterSave() {
  const checkArticleRecordButton = document.getElementById('actionCheckArticleRecord');
  const saveArticleRecordButton = document.getElementById('actionSaveArticleRecord');
  const forwardIcon = document.getElementById('actionForward');
  const recordNotes = document.getElementById('articleRecordNotes');

  disableElement(checkArticleRecordButton);
  disableElement(saveArticleRecordButton);
  forwardIcon.classList.remove('proceed');
  recordNotes.innerHTML = 'Kuvailtu artikkeli tallennettiin ARTO-kokoelmaan';
  recordNotes.classList.remove('record-error');
  recordNotes.classList.remove('record-valid');
  recordNotes.classList.add('record-success');
}
