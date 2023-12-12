import {idbGet} from '/artikkelit/utils/indexedDB.js';
import {validateArticleRecord} from '/common/rest.js';
import {enableElement, highlightElement, showNotificationBanner, startProcess, stopProcess} from '/common/ui-utils.js';




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
      showNotificationBanner({style: 'alert', text: 'Valitettavasti tietueen käsittelyssä tapahtui virhe'})
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
        if (result.status === 409) {
          validationConflict();
          return;
        }
        //the status code is something else => general error
        throw new Error(`Validation responded with error status ${result.status}`);
      }
    })
    .catch((error) => {
      console.log('Error validating record: ', error);
      showNotificationBanner({style: 'error', text: 'Valitettavasti tietuetta ei voitu tarkistaa'});
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
    recordNotes.classList.remove('record-error');

    enableElement(saveArticleRecordButton);
    forwardIcon.classList.add('proceed');
    showNotificationBanner({style: 'info', text: 'Voit nyt tallentaa tietueen'});
  }


  function validationFailed() {
    console.log('Article record failed check!')

    recordNotes.innerHTML = 'Tietueen tarkistuksessa löytyi virheitä. <br> <br> Tietuetta ei voi tallentaa.'
    recordNotes.classList.add('record-error');
    recordNotes.classList.remove('record-valid');

    highlightElement(recordNotes);
    highlightElement(recordNotes);
    showNotificationBanner({style: 'alert', text: 'Korjaa lomakkeen tiedot ja tarkista sitten tietue uudelleen.'});
  }


  function validationConflict() {
    console.log('Article record has possible duplicate!')

    recordNotes.innerHTML = 'Tietueen tarkistuksessa löytyi mahdollinen kaksoiskappale <br> <br> Tietuetta ei voi tallentaa.'
    recordNotes.classList.add('record-error');
    recordNotes.classList.remove('record-valid');
    highlightElement(recordNotes);
    showNotificationBanner({style: 'alert', text: 'Tarkista onko vastaava tietue jo luotu aiemmin.'});
  }


}
