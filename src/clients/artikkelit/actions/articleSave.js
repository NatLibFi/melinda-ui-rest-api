import {showFormActionsAfterSave, showRecordActionsAfterSave} from '/artikkelit/actions/articleModes.js'
import {idbGet} from '/artikkelit/utils/indexedDB.js';
import {addArticleRecord} from '/common/rest.js';
import {showNotification, startProcess, stopProcess} from '/common/ui-utils.js';



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

  showNotification({componentStyle: 'banner', status: 'info', text: 'Toiminto peruttu!'});
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
      showNotification({componentStyle: 'banner', style: 'alert', text: 'Valitettavasti tietueen käsittelyssä tapahtui virhe'});
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
        if (result.status === 409) {
          recordAdditionFailed(result);
          return;
        }
        throw new Error(`Adding record responded with not ok status ${result.status}`);
      }
    })
    .catch((error) => {
      console.log('Article record save failed, error: ', error);
      showNotification({componentStyle: 'banner', style: 'error', text: 'Valitettavasti artikkelia ei pystytty tallentamaan ARTO-kokoelmaan'});
    })
    .finally(() => {
      stopProcess();
    });


  function recordAdditionSuccess(result) {
    console.log('Article record saved with statustext: ', result.statusText);

    showRecordActionsAfterSave();
    showArticleFormReadMode();
    showFormActionsAfterSave();
    showNotification({componentStyle: 'banner', style: 'success', text: 'Tietueen tallennus onnistui'});
  }


  function recordAdditionFailed(result) {
    console.log('Article record was not saved, statustext: ', result.statusText);

    const recordNotes = document.getElementById('articleRecordNotes');

    recordNotes.innerHTML = 'Tietuetta tallentaessa löytyi mahdollinen duplikaatti. <br> <br> Tietuetta ei voitu tallentaa.'
    recordNotes.classList.add('record-error');
    highlightElement(recordNotes);
    showNotification({componentStyle: 'banner', style: 'alert', text: 'Valitettavasti artikkelia ei pystytty tallentamaan ARTO-kokoelmaan'});
  }
}

