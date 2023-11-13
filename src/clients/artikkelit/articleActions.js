import {enableElement, startProcess, stopProcess, showSnackbar} from '/common/ui-utils.js';

// Function for checking article record
// Notify user of the results in notes section and then
//    - if problem, disable open dialog button
//    - if check is ok, enable open dialog button, 
//        so that user can proceed to save the article record
window.checkArticleRecord = function(event = undefined) {
  console.log('Checking article record...');
  const notes = document.getElementById('articleRecordNotes');
  const recordValid = true; //noop fetch from rest
  const errors = ['Duplicate title', 'Field 772 incorrect', 'Field 960 missing character'];

  if (!recordValid) {
    console.log('Article record failed check!')
    showSnackbar({style: 'alert', text: 'Tarkista tietueen virheet'});
    notes.innerHTML = errors;
    return;
  }

  const saveArticleRecordButton = document.getElementById('saveArticleRecord');
  console.log(saveArticleRecordButton)
  enableElement(saveArticleRecordButton);
  console.log('Article record passed check!')
  showSnackbar({style: 'info', text: 'Voit nyt tallentaa tietueen'});
  notes.innerHTML = 'Tietueen tarkistuksessa ei löytynyt virheitä'
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
  showSnackbar({style: 'success', text: 'Kuvailtu artikkeli tallennettiin ARTO-kokoelmaan'});
  stopProcess();
}