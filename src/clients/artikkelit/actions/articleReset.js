import {refreshAllLists} from '/artikkelit/actions/articleUpdate.js';
import {resetAndHideCcLicense} from '/artikkelit/interfaces/articleBasic.js';
import {resetPublicationSearchResultSelect} from '/artikkelit/interfaces/publicationSearch.js';
import {resetReviewSearchResultSelect} from '/artikkelit/interfaces/reviewSearch.js';
import {idbClear, getTableNames} from '/artikkelit/utils/indexedDB.js';
import {showNotificationBanner} from '/common/ui-utils.js';


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
