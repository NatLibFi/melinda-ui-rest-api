/*****************************************************************************/
/*                                                                           */
/* Functions for article record actions: check record and save record        */
/*                                                                           */
/*****************************************************************************/

import {collectFormData} from '/artikkelit/artikkelit.js';
import {idbGet} from '/artikkelit/indexDB.js';
import {
  disableElement, enableElement, getAllDescendants, highlightElement, isHidden,
  isVisible, showSnackbar, startProcess, stopProcess
} from '/common/ui-utils.js';
import {addArticleRecord, validateArticleRecord} from '/common/rest.js';



/*****************************************************************************/
/* CHECK (VALIDATE) RECORD                                                   */
/*****************************************************************************/

//---------------------------------------------------------------------------//
// Function for checking article record
//   - get record from indexedDB  
//   - then call function validateRecord and pass the record as parameter
window.checkArticleRecord = function (event = undefined) {
  console.log('Checking article record...');
  eventHandled(event);
  startProcess();

  idbGet('artoRecord', 'record')
    .then((data) => {
      validateRecord(data);
    })
    .catch((error) => {
      console.log('Error getting record from indexedDB (if undefined, probably it is not yet set): ', error);
      showSnackbar({style: 'alert', text: 'Valitettavasti tietueen käsittelyssä tapahtui virhe'})
    })
}


//---------------------------------------------------------------------------//
// Function for validating record data
//    - send record to rest api for validation
//    - check response status
//        * if status is 200, validation passed
//        * if status is 422, validation failed
//        * other statuses, handle as error
function validateRecord(data) {
  const recordNotes = document.getElementById('articleRecordNotes');

  validateArticleRecord(data)
    .then((result) => {
      console.log('Validation result: ', result);

      //response ok status is true (status code range 200-299)
      if (result.ok) {
        //status code is 200 OK => validation passed
        if (result.status === 200) {
          validationPassed();
          return;
        }
        //status code is 2?? => general error
        throw new Error(`Validation responded with ok status ${result.status}`);
      }

      //response ok status is false
      if (!result.ok) {
        //code is 422 Unprocessable content => validation failed
        if (result.status === 422) {
          validationFailed();
          return;
        }
        //the status code is something else => general error
        throw new Error(`Validation responded with error status ${result.status}`);
      }
    })
    .catch((error) => {
      console.log('Error validating record: ', error);
      showSnackbar({style: 'alert', text: 'Valitettavasti tietuetta ei voitu tarkistaa'});
    })
    .finally(() => {
      stopProcess();
    });

  function validationPassed() {
    console.log('Article record passed check!')

    const saveArticleRecordButton = document.getElementById('actionSaveArticleRecord');
    const forwardIcon = document.getElementById('actionForward');

    recordNotes.innerHTML = 'Tietueen tarkistuksessa ei löytynyt virheitä.'
    recordNotes.classList.add('record-valid');
    enableElement(saveArticleRecordButton);
    forwardIcon.classList.add('proceed');
    showSnackbar({style: 'info', text: 'Voit nyt tallentaa tietueen'});
  }

  function validationFailed() {
    console.log('Article record failed check!')

    recordNotes.innerHTML = 'Tietueen tarkistuksessa löytyi virheitä. <br> <br> Tietuetta ei voi tallentaa.'
    recordNotes.classList.add('record-error');
    highlightElement(recordNotes);
    showSnackbar({style: 'alert', text: 'Korjaa lomakkeen tiedot ja tarkista sitten tietue uudelleen.'});
  }

}



/*****************************************************************************/
/* SAVE RECORD                                                               */
/*****************************************************************************/

//---------------------------------------------------------------------------//
// Function for opening dialog window
window.openSaveArticleRecordDialog = function (event = undefined) {
  eventHandled(event);
  const dialog = document.getElementById('dialogForSave');

  dialog.showModal();
};

//---------------------------------------------------------------------------//
// Discard action in dialog window
window.cancelSave = function (event = undefined) {
  console.log('Nothing saved');

  showSnackbar({status: 'info', text: 'Toiminto peruttu!'});
};

//---------------------------------------------------------------------------//
// Confirm action in dialog window
window.confirmSave = function (event = undefined) {
  console.log('Saving article record...');

  startProcess();
  saveArticleRecord();
};

//---------------------------------------------------------------------------//
// Function to save the article
//    -get the article from idb
//    -then pass the record as parameter to function addRecord
function saveArticleRecord() {

  idbGet('artoRecord', 'record')
    .then((data) => {
      addRecord(data);
    })
    .catch((error) => {
      console.log('Error getting record from indexedDB (if undefined, probably it is not yet set): ', error);
      showSnackbar({style: 'alert', text: 'Valitettavasti tietueen käsittelyssä tapahtui virhe'});
    })
}

//---------------------------------------------------------------------------//
// Function for creating record data
//    - send record to rest api for addition
//    - check response status
//        * if status is 201, creation ok
//            => call function addRecordSuccess and pass the result as parameter
//        * other statuses, handle as error
function addRecord(data) {

  addArticleRecord(data)
    .then((result) => {
      console.log('Adding record to ARTO collection, result: ', result);

      if (result.ok) {
        if (result.status === 201) {
          recordAdditionSuccess(result);
          return;
        }
        throw new Error(`Adding record responded with ok status ${result.status}`);
      }

      if (!result.ok) {
        throw new Error(`Adding record responded with not ok status ${result.status}`);
      }
    })
    .catch((error) => {
      console.log('Article record save failed, error: ', error);
      showSnackbar({style: 'error', text: 'Valitettavasti artikkelia ei pystytty tallentamaan ARTO-kokoelmaan'});
    })
    .finally(() => {
      stopProcess();
    });

  function recordAdditionSuccess(result) {
    console.log('Article record saved with statustext: ', result.statusText);

    showRecordActionsAfterSave();
    showArticleFormReadMode();
    showFormActionsAfterSave();
    showSnackbar({style: 'success', text: 'Tietueen tallennus onnistui'});
  }
}



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
  showSnackbar({style: 'info', text: 'Aloitetaan uusi kuvailu tyhjältä pohjalta'})
}

//---------------------------------------------------------------------------//
// Function for copying the saved record
// and starting new article record with prefilled form fields
window.startNewCopyForm = function (event = undefined) {
  console.log('Start new record with copied form')
  eventHandled(event);

  //TODO
}



/*****************************************************************************/
/* READ MODE (EDIT OFF) AND EDIT MODE                                        */
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
  const formData = collectFormData();
  const formNotes = document.getElementById('articleFormNotes');

  fillPreview(formData);
  enableElement(showEditModeButton);
  disableElement(showReadModeButton);
  disableElement(clearFormButton);
  formNotes.innerHTML = 'Lomakkeella näytetään nyt kentät, joihin olet lisännyt tietoja.';

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
  const formNotes = document.getElementById('articleFormNotes');

  enableElement(showReadModeButton);
  disableElement(showEditModeButton);
  enableElement(clearFormButton);
  formNotes.innerHTML = 'Lomakkeelle lisäämäsi tiedot päivittyvät myös tietueen esikatseluun.';

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
}




/*****************************************************************************/
/* HELPER FUNCTIONS FOR ARTICLE ACTIONS                                      */
/*****************************************************************************/

//---------------------------------------------------------------------------//
// Function for resetting check and save buttons and record preview
export function resetCheckAndSave() {
  const recordNotes = document.getElementById('articleRecordNotes');
  const checkArticleRecordButton = document.getElementById('actionCheckArticleRecord');
  const saveArticleRecordButton = document.getElementById('actionSaveArticleRecord');
  const forwardIcon = document.getElementById('actionForward');

  recordNotes.classList.remove('record-error');
  recordNotes.classList.remove('record-valid');
  recordNotes.classList.remove('record-success');
  recordNotes.innerHTML = 'Tarkista tietue ennen tallentamista.';

  disableElement(saveArticleRecordButton);
  enableElement(checkArticleRecordButton);
  forwardIcon.classList.remove('proceed');
}

//---------------------------------------------------------------------------//
// Function for making set of buttons in form toolbar visible,
// when form is still editable
function showFormActionsOnEdit() {
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
function showFormActionsAfterSave() {
  const divActionsOnEdit = document.getElementById('actionsOnEdit');
  const showEditModeButton = document.getElementById('formEditMode');
  const showReadModeButton = document.getElementById('formReadMode');
  const clearFormButton = document.getElementById('formClear');

  const divActionsAfterSave = document.getElementById('actionsAfterSave');
  const newEmptyRecordButton = document.getElementById('emptyRecord');
  //const newCopyRecordButton = document.getElementById('copyRecord');

  const formNotes = document.getElementById('articleFormNotes');

  disableElement(showEditModeButton);
  disableElement(showReadModeButton);
  disableElement(clearFormButton);
  divActionsOnEdit.style.display = 'none';

  enableElement(newEmptyRecordButton);
  //enableElement(newCopyRecordButton);
  divActionsAfterSave.style.display = 'flex';

  formNotes.innerHTML = 'Aloita uusi kuvailu tyhjältä lomakkeelta tai käytä nykyistä lomaketta pohjana.';
  formNotes.classList.add('record-valid');
}

//---------------------------------------------------------------------------//
// Function for making set of buttons in form toolbar disabled
// when form is locked and the record is saved
function showRecordActionsAfterSave() {
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

