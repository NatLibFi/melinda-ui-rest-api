import {disableElement, enableElement, highlightElement, showSnackbar, startProcess, stopProcess} from '/common/ui-utils.js';



export function resetCheckAndSave() {
  const notes = document.getElementById('articleRecordNotes');
  const saveArticleRecordButton = document.getElementById('saveArticleRecord');

  notes.classList.remove('record-error');
  notes.classList.remove('record-success');
  notes.innerHTML = 'Tarkista tietue ennen tallentamista.';
  disableElement(saveArticleRecordButton);

}

// Function for checking article record
// Notify user of the results in notes section and then
//    - if problem, disable open dialog button
//    - if check is ok, enable open dialog button, 
//        so that user can proceed to save the article record
window.checkArticleRecord = function (event = undefined) {
  console.log('Checking article record...');
  const notes = document.getElementById('articleRecordNotes');

  //doUpdate();

  const recordValid =true; //noop fetch from rest
  const errors = ['Duplicate title', 'Field 772 incorrect', 'Field 960 missing character'];

  if (!recordValid) {
    console.log('Article record failed check!')
    showSnackbar({style: 'alert', text: 'Tarkista tietueen virheet'});
    notes.classList.add('record-error');
    notes.innerHTML = errors;

    //highlight problematic fields, if possible
    highlightElement(notes);
    return;
  }

  const saveArticleRecordButton = document.getElementById('saveArticleRecord');
  enableElement(saveArticleRecordButton);
  notes.innerHTML = 'Tietueen tarkistuksessa ei löytynyt virheitä'
  notes.classList.add('record-success');
  //highlightElement(notes, 'var(--color-functional-green)');

  console.log('Article record passed check!')
  showSnackbar({style: 'info', text: 'Voit nyt tallentaa tietueen'});
}

// Action for opening dialog window
// first check article record once more?
//    -if problem, notify user and stop
//    -otherwise, open the dialog window
window.openSaveArticleRecordDialog = function (event = undefined) {
  eventHandled(event);
  const dialog = document.getElementById('dialogForSave');

  const recordValid = true //checkArticleRecord()?

  if (!recordValid) {
    console.log('Article record is not valid');
    showSnackbar({style: 'alert', text: 'Tietueesta löytyi virhe, tietuetta ei voida tallentaa'});
    stopProcess();
    return;
  }

  dialog.showModal();
};


// Discard action in dialog window
window.cancelSave = function (event = undefined) {
  console.log('Nothing saved');
  showSnackbar({status: 'info', text: 'Toiminto peruttu!'});
};

// Confirm action in dialog window
window.confirmSave = function (event = undefined) {
  console.log('Saving article record...');
  startProcess();
  saveArticleRecord();
};

// Save the article and
// notify user if successful operation
function saveArticleRecord() {
  console.log('TODO: function saveArticleRecord')

  //call rest function, save record, get result
  const result = ''
  const error = false;

  //success:
  if (result && !error) {
    console.log('Article record saved.')
    showSnackbar({style: 'success', text: 'Kuvailtu artikkeli tallennettiin ARTO-kokoelmaan'});

    const saveArticleRecordButton = document.getElementById('saveArticleRecord');
    disableElement(saveArticleRecordButton);

    //should the user be able to choose to use same template for next article?
  }

  //error
  if (error) {
    console.log('Article record save failed, error: ', error);
    showSnackbar({style: 'error', text: 'Valitettavasti artikkelia ei pystytty tallentamaan ARTO-kokoelmaan'});

    //should to user be able to save progress so far?
  }

  //finally
  stopProcess();
}