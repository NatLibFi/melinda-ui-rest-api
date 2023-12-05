import {showSnackbar} from '/common/ui-utils.js';
import {idbClear, getTableNames} from '/artikkelit/indexDB.js';
import {resetAndHideCcLicense} from '/artikkelit/interfaces/article.js';
import {resetPublicationSearchResultSelect} from '/artikkelit/interfaces/publicationSearch.js';
import {resetReviewSearchResultSelect} from '/artikkelit/interfaces/reviewSearch.js';
import {refreshAllLists} from '/artikkelit/actions/articleUpdate.js';


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
  showSnackbar({style: 'info', text: 'Lomake tyhjennetty'});
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
