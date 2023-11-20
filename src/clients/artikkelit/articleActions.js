/*****************************************************************************/
/*                                                                           */
/* Functions for article record actions: check record and save record        */
/*                                                                           */
/*****************************************************************************/

import {
  disableElement, enableElement, getAllDescendants, highlightElement, isHidden,
  isVisible, showSnackbar, startProcess, stopProcess
} from '/common/ui-utils.js';
import {validateArticleRecord, addArticleRecord} from '/common/rest.js';
import {idbGet} from '/artikkelit/indexDB.js';
import {collectFormData} from '/artikkelit/artikkelit.js';


/*****************************************************************************/
/* CHECK (VALIDATE) RECORD                                                   */
/*****************************************************************************/

//---------------------------------------------------------------------------//
// Function for checking article record
//   - get record from indexedDB  
//   - then pass the record for validating
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
  const notes = document.getElementById('articleRecordNotes');

  validateArticleRecord(data)
    .then((result) => {
      console.log('Validation result: ', result);

      if (result.ok) {
        if (result.status === 200) {
          validationPassed();
          return;
        }
        throw new Error(`Validation responded with ok status ${result.status}`);
      }

      if (!result.ok) {
        if (result.status === 422) {
          validationFailed();
          return;
        }
        throw new Error(`Validation responded with error status ${result.status}`);
      }
    })
    .catch((error) => {
      console.log('Error validating record: ', error);
      showSnackbar({style: 'alert', text: 'Valitettavasti tietuetta ei voitu tarkistaa'})
    })
    .finally(() => stopProcess());


  function validationFailed() {
    console.log('Article record failed check!')

    notes.innerHTML = 'Tietueen tarkistuksessa löytyi virheitä. <br> <br> Tietuetta ei voi tallentaa.'
    notes.classList.add('record-error');

    highlightElement(notes);
    showSnackbar({style: 'alert', text: 'Korjaa lomakkeen tiedot ja tarkista sitten tietue uudelleen.'});
  }

  function validationPassed() {
    console.log('Article record passed check!')

    notes.innerHTML = 'Tietueen tarkistuksessa ei löytynyt virheitä.'
    notes.classList.add('record-valid');

    const saveArticleRecordButton = document.getElementById('actionSaveArticleRecord');
    const forwardIcon = document.getElementById('actionForward');

    enableElement(saveArticleRecordButton);
    forwardIcon.classList.add('proceed');

    showSnackbar({style: 'info', text: 'Voit nyt tallentaa tietueen'});
  }
}



/*****************************************************************************/
/* SAVE RECORD DIALOG FUNCTIONS                                              */
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
// Save the article and
// notify user if successful operation
function saveArticleRecord() {

  idbGet('artoRecord', 'record')
    .then((data) => {
      addRecord(data);
    })
    .catch((error) => {
      console.log('Error getting record from indexedDB (if undefined, probably it is not yet set): ', error);
      showSnackbar({style: 'alert', text: 'Valitettavasti tietueen käsittelyssä tapahtui virhe'})
    })
}

//---------------------------------------------------------------------------//
// Function for creating record data
//    - send record to rest api for addition
//    - check response status
//        * if status is 201, creation ok
//        * other statuses, handle as error
function addRecord(data) {

  addArticleRecord(data)
    .then((result) => {
      console.log('Adding record result: ', result);

      if (result.ok) {
        if (result.status === 201) {
          addRecordSuccess(result);
          return;
        }
        throw new Error(`Adding record responded with ok status ${result.status}`);
      }

      if (!result.ok) {
        throw new Error(`Adding record responded with error status ${result.status}`);
      }
    })
    .catch((error) => {
      console.log('Article record save failed, error: ', error);
      showSnackbar({style: 'error', text: 'Valitettavasti artikkelia ei pystytty tallentamaan ARTO-kokoelmaan'});

    })
    .finally(() => stopProcess());

  function addRecordSuccess() {
    console.log('Article record saved.')
    showSnackbar({style: 'success', text: 'Tietueen tallennus onnistui'});

    const checkArticleRecordButton = document.getElementById('actionCheckArticleRecord');
    const saveArticleRecordButton = document.getElementById('actionSaveArticleRecord');
    const forwardIcon = document.getElementById('actionForward');
    const showEditModeButton = document.getElementById('formEditMode');
    const newEmptyRecordButton = document.getElementById('actionNewEmpty');
    const newCopyRecordButton = document.getElementById('actionNewEmpty');
    const divActionsOnEdit = document.getElementById('actionsOnEdit');
    const divActionsAfterSave = document.getElementById('actionsAfterSave');

    const recordNotes = document.getElementById('articleRecordNotes');
    const formNotes = document.getElementById('articleFormNotes');


    disableElement(checkArticleRecordButton);
    disableElement(saveArticleRecordButton);
    forwardIcon.classList.remove('proceed');
    recordNotes.innerHTML = 'Kuvailtu artikkeli tallennettiin ARTO-kokoelmaan'
    recordNotes.classList.remove('record-error');
    recordNotes.classList.remove('record-valid');
    recordNotes.classList.add('record-success');

    showArticleFormReadMode();
    disableElement(showEditModeButton);
    divActionsOnEdit.style.display = 'none';
    divActionsAfterSave.style.display = 'flex';
   
    enableElement(newEmptyRecordButton);
    //TODO: should the user be able to choose to use same template for next article?
    // disable the copy button for now
    disableElement(newCopyRecordButton);

    formNotes.innerHTML = 'Aloita uusi kuvailu tyhjältä lomakkeelta tai käytä nykyistä lomaketta pohjana.'; 
    formNotes.classList.add('record-valid');
  }
}



/*****************************************************************************/
/* START NEW RECORD ACTIONS                                                  */
/*****************************************************************************/

//---------------------------------------------------------------------------//
// Function for clearing all form fields and 
window.startNewEmptyForm = function(event=undefined) {
  console.log('Start new record with empty form')
  eventHandled(event);
  
  const divActionsOnEdit = document.getElementById('actionsOnEdit');
  const divActionsAfterSave = document.getElementById('actionsAfterSave');
  const formNotes = document.getElementById('articleFormNotes');

  divActionsOnEdit.style.display = 'flex';
  divActionsAfterSave.style.display = 'none';
  showArticleFormEditMode();
  clearAllFields();
  formNotes.classList.remove('record-valid');

  showSnackbar({style: 'info', text: 'Aloitetaan uusi kuvailu tyhjältä pohjalta'})
}


/*****************************************************************************/
/* HELPER FUNCTIONS FOR ARTICLE ACTIONS                                      */
/*****************************************************************************/

//---------------------------------------------------------------------------//
// Function for resetting check and save buttons and record preview
export function resetCheckAndSave() {
  const notes = document.getElementById('articleRecordNotes');
  const checkArticleRecordButton = document.getElementById('actionCheckArticleRecord');
  const saveArticleRecordButton = document.getElementById('actionSaveArticleRecord');
  const forwardIcon = document.getElementById('actionForward');

  notes.classList.remove('record-error');
  notes.classList.remove('record-valid');
  notes.classList.remove('record-success');
  notes.innerHTML = 'Tarkista tietue ennen tallentamista.';

  disableElement(saveArticleRecordButton);
  enableElement(checkArticleRecordButton);
  forwardIcon.classList.remove('proceed');
}


//---------------------------------------------------------------------------//
// Function for displaying form in read mode
// Hides all edit fields and buttons from view
window.showArticleFormReadMode = function (event = undefined) {
  console.log('Showing article form in read mode');
  eventHandled(event);

  const fieldsets = document.querySelectorAll('#artikkelit #articleForm #fieldsets fieldset');
  const showReadModeButton = document.getElementById('formReadMode');
  const showEditModeButton = document.getElementById('formEditMode');
  const clearFormButton = document.getElementById('formClear');
  const formData = collectFormData();
  const notes = document.getElementById('articleFormNotes');


  fillPreview(formData);
  enableElement(showEditModeButton);
  disableElement(showReadModeButton);
  disableElement(clearFormButton);
  notes.innerHTML = 'Lomakkeella näytetään nyt kentät, joihin olet lisännyt tietoja.';

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
// Function for displaying form edit mode
// makes the elements that were hidden on read mode visible
window.showArticleFormEditMode = function (event = undefined) {
  console.log('Showing article form in edit mode');
  eventHandled(event);

  const fieldsets = document.querySelectorAll('#artikkelit #articleForm #fieldsets fieldset');
  const showReadModeButton = document.getElementById('formReadMode');
  const showEditModeButton = document.getElementById('formEditMode');
  const clearFormButton = document.getElementById('formClear');
  const notes = document.getElementById('articleFormNotes');

  enableElement(showReadModeButton);
  disableElement(showEditModeButton);
  enableElement(clearFormButton);
  notes.innerHTML = 'Lomakkeelle lisäämäsi tiedot päivittyvät myös tietueen esikatseluun.';

  fieldsets.forEach((fieldset) => {
    for (const child of fieldset.children) {

      showButtons(child);

      if (child.classList.contains('hidden-in-read-mode')) {
        child.style.display = 'flex';
        child.classList.remove('hidden-in-read-mode')
      }

      if (child.classList.contains('hidden-in-edit-mode')) {
        child.style.display = 'none';
      }
    }

    function showButtons(element) {
      getAllDescendants(element).forEach((descendant) => {
        if (descendant.tagName === 'BUTTON' && descendant.classList.contains('hidden-in-read-mode')) {
          descendant.style.visibility = 'visible';
          descendant.classList.remove('hidden-in-read-mode')
        }
      })
    }
  })
}


