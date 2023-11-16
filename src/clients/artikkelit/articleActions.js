/*****************************************************************************/
/*                                                                           */
/* Functions for article record actions: check record and save record        */
/*                                                                           */
/*****************************************************************************/

import {disableElement, enableElement, highlightElement, showSnackbar, startProcess, stopProcess} from '/common/ui-utils.js';
import {validateArticleRecord, addArticleRecord} from '/common/rest.js';
import {idbGet} from '/artikkelit/indexDB.js';


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

    const notes = document.getElementById('articleRecordNotes');

    disableElement(checkArticleRecordButton);
    disableElement(saveArticleRecordButton);
    forwardIcon.classList.remove('proceed');


    notes.innerHTML = 'Kuvailtu artikkeli tallennettiin ARTO-kokoelmaan'
    notes.classList.remove('record-error');
    notes.classList.remove('record-valid');
    notes.classList.add('record-success');

    //TODO: should the user be able to choose to use same template for next article?
  }
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


