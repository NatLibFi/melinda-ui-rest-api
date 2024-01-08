import {validateForm} from '/artikkelit/actions/articleValidateForm.js';
import {idbGet} from '/artikkelit/utils/indexedDB.js';
import {validateArticleRecord} from '/common/rest.js';
import {enableElement, highlightElement, showSnackbar, startProcess, stopProcess} from '/common/ui-utils.js';



/*****************************************************************************/
/* CHECK FORM AND CHECK RECORD                                               */
/*****************************************************************************/


// Function for checking both article form and article record
// Record is checked only after the form passes check
window.checkArticle = function (event = undefined) {
  eventHandled(event);

  const articleFormValid = checkArticleForm();

  if (!articleFormValid) {
    showSnackbar({style: 'alert', text: 'Korjaa ensin virheet lomakkeen täytössä.'});
    return;
  }

  checkArticleRecord();
}


//---------------------------------------------------------------------------//
// Function for checking article form
//   - gets all required fields in the form that are still unfilled  
//      - if such fields exist, form check fails
//      - otherwise check is passed
export function checkArticleForm() {
  //console.log('Checking article form...');

  const formNotes = document.getElementById('articleFormNotes');
  const highlightErrorsButton = document.getElementById('formShowErrors');
  const highlightErrorsButtonTextSpan = document.getElementById('formErrorNumber');

  const formErrors = validateForm();
  highlightErrorsButtonTextSpan.textContent = formErrors.length;

  return formErrors.length > 0 ? formCheckFailed() : formCheckPassed();


  function formCheckFailed() {
    highlightErrorsButton.classList.remove('checkPassed');
    highlightErrorsButton.classList.add('checkFailed');

    formNotes.innerHTML = getErrorNote();
    formNotes.classList.remove('record-valid');
    formNotes.classList.add('record-error');

    return false;

    function getErrorNote() {
      const numberOfErrors = `Tarkista virheet lomakkeen täytössä (yhteensä ${formErrors.length} kpl).`

      let formattedErrors = '';

      formErrors.forEach((error) => {
        if (error.errorType === 'unfilledRequiredField') {
          formattedErrors = formattedErrors + `<li>Vaadittu tieto puuttuu => osiossa <b>${error.fieldsetLegend}</b> => kenttä <b>${error.label}</b> tyhjä</li>`;
        }

        if (error.errorType === 'unsubmittedField') {
          formattedErrors = formattedErrors + `<li>Tietojen lisäys kesken => osiossa <b>${error.fieldsetLegend}</b> => kenttä <b>${error.label}</b> muutettu</li>`;
        }

      })

      return numberOfErrors + '<ul>' + formattedErrors + '</ul>';
    }
  }

  function formCheckPassed() {
    highlightErrorsButton.classList.remove('checkFailed');
    highlightErrorsButton.classList.add('checkPassed');

    formNotes.innerHTML = 'Lomakkeesta ei löydy virheitä.';
    formNotes.classList.remove('record-error');
    formNotes.classList.add('record-valid');

    return true;
  }

}


window.highlightUnvalidFormElements = function () {
  const formErrors = validateForm();

  formErrors.forEach((error) => {
    highlightElement(error.element);
  })
}


//---------------------------------------------------------------------------//
// Function for checking article record
//   - get record from indexedDB  
//   - then call function validateRecord and pass the record as parameter
function checkArticleRecord(event = undefined) {
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
      showSnackbar({style: 'error', text: 'Valitettavasti tietuetta ei voitu tarkistaa'});
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
    showSnackbar({style: 'info', text: 'Voit nyt tallentaa tietueen'});
  }


  function validationFailed() {
    console.log('Article record failed check!')

    recordNotes.innerHTML = 'Tietueen tarkistuksessa löytyi virheitä.'
    recordNotes.classList.add('record-error');
    recordNotes.classList.remove('record-valid');

    highlightElement(recordNotes);
    highlightElement(recordNotes);
    showSnackbar({style: 'alert', text: 'Korjaa tietue ja yritä sitten tarkistusta uudelleen.'});
  }


  function validationConflict() {
    console.log('Article record has possible duplicate!')

    recordNotes.innerHTML = 'Tietueen tarkistuksessa löytyi mahdollinen kaksoiskappale.'
    recordNotes.classList.add('record-error');
    recordNotes.classList.remove('record-valid');
    highlightElement(recordNotes);
    showSnackbar({style: 'alert', text: 'Tarkista onko vastaava tietue jo luotu aiemmin.'});
  }


}
