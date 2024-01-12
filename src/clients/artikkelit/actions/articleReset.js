import {refreshAllLists} from '/artikkelit/actions/articleUpdate.js';
import {resetAndHideCcLicense} from '/artikkelit/interfaces/articleBasic.js';
import {resetPublicationSearchResultSelect} from '/artikkelit/interfaces/publicationSearch.js';
import {resetReviewSearchResultSelect} from '/artikkelit/interfaces/reviewSearch.js';
import {idbClear, getTableNames} from '/artikkelit/utils/indexedDB.js';
import {disableElement, enableElement, showNotificationBanner} from '/common/ui-utils.js';


export function idbClearAllTables() {
  for (const tableName of getTableNames()) {
    idbClear(tableName);
  }
}

window.clearAllFields = function () {
  idbClearAllTables();
  resetPublicationSearchResultSelect();
  refreshAllLists();
  resetReviewSearchResultSelect();
  resetInputFields();
  resetTextareaFields();
  resetSelectFields();
  resetAndHideCcLicense();
  showNotificationBanner({style: 'info', text: 'Lomake tyhjennetty'});
};

function resetInputFields() {
  for (const inputField of document.getElementsByTagName('input')) {
    inputField.value = '';
  }
}

function resetTextareaFields() {
  for (const textarea of document.getElementsByTagName('textarea')) {
    textarea.value = '';
  }
}

function resetSelectFields() {
  for (const selectField of document.getElementsByTagName('select')) {
    selectField.selectedIndex = 0;
    selectField.dispatchEvent(new Event('change'));
  }
}


//---------------------------------------------------------------------------//
// Function for resetting record action buttons and related form and record notes
export function resetCheckAndSave() {
  const formNotes = document.getElementById('articleFormNotes');
  const recordNotes = document.getElementById('articleRecordNotes');
  const checkArticleRecordButton = document.getElementById('actionCheckArticleRecord');
  const saveArticleRecordButton = document.getElementById('actionSaveArticleRecord');
  const forwardIcon = document.getElementById('actionForward');

  formNotes.classList.remove('record-error');
  formNotes.classList.remove('record-valid');
  formNotes.classList.remove('record-success');
  formNotes.innerHTML = '';

  recordNotes.classList.remove('record-error');
  recordNotes.classList.remove('record-valid');
  recordNotes.classList.remove('record-success');
  recordNotes.innerHTML = 'Tarkista tietue ennen tallentamista.';

  disableElement(saveArticleRecordButton);
  enableElement(checkArticleRecordButton);
  forwardIcon.classList.remove('proceed');
}

