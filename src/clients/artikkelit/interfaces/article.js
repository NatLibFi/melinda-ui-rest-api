import {idbClear} from '/artikkelit/utils/indexDB.js';
import {refreshReviewsList} from '/artikkelit/interfaces/reviewSearch.js';
import {createIconButton} from '/common/ui-utils.js';

export function initArticle() {
  console.log('initializing article...');
  document.getElementById('lisaa-linkki').addEventListener('click', addArticleLink);
  resetAndHideCcLicense();
}

window.articleTypeChange = (event) => {
  const reviewFieldset = document.getElementById('arvostellun-teoksen-tiedot');
  const addedReviews = document.getElementById('arvostellut-teokset');
  const selectedType = event.target.value;

  reviewFieldset.style.display = 'flex';
  addedReviews.style.display = 'flex';

  if (['A1', 'A2', 'A3'].some(str => selectedType.includes(str))) {
    reviewFieldset.style.display = 'none';
    addedReviews.style.display = 'none';
    idbClear('artoReviews');
    resetReview();
    refreshReviewsList();
  }
};

window.removeArticleLink = (event) => {
  event.preventDefault();
  event.target.parentElement.remove();
};

function addArticleLink(event) {
  event.preventDefault();
  const articleWrap = document.getElementById('artikkelin-linkki-wrap');
  const upperDiv = document.createElement('div');
  upperDiv.classList.add('full-width');
  const lowerDiv = document.createElement('div');
  lowerDiv.classList.add('Input');
  const removeButton = createIconButton('delete_outline', ['alternate-red', 'small'], `return removeArticleLink(event)`, 'Poista');
  lowerDiv.appendChild(createLabel('artikkelin-linkki'));
  lowerDiv.appendChild(createInput('artikkelin-linkki'));
  upperDiv.appendChild(lowerDiv);
  upperDiv.appendChild(removeButton);
  articleWrap.appendChild(upperDiv);

  function createLabel(id) {
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.innerHTML = 'Linkki kokotekstiin:';
    return label;
  }

  function createInput(name) {
    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('id', name);
    input.setAttribute('name', name);
    input.setAttribute('maxLength', 128);
    return input;
  }
}

export function showCcLicense() {
  const ccLicenseFormField = document.getElementById('artikkelin-cc-lisenssi-wrap');
  const ccLicenseSelect = document.getElementById('artikkelin-cc-lisenssi');

  ccLicenseFormField.style.display = 'block';
  ccLicenseSelect.removeAttribute('disabled');
}

export function resetAndHideCcLicense() {
  const ccLicenseSelect = document.getElementById('artikkelin-cc-lisenssi');
  const ccLicenseFormField = document.getElementById('artikkelin-cc-lisenssi-wrap');

  ccLicenseSelect.selectedIndex = 0;
  hideCcLicense();

  function hideCcLicense() {
    ccLicenseFormField.style.display = 'none';
    ccLicenseSelect.disabled = true;
  }
}
