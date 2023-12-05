import {showTab} from '/common/ui-utils.js';
import {Account, doLogin, logout} from '/common/auth.js';
import {} from './articleActions.js';
import {initAbstracts} from '/artikkelit/interfaces/abstracts.js';
import {initAdditionalFields} from '/artikkelit/interfaces/additionalFields.js';
import {initArticle} from '/artikkelit/interfaces/article.js';
import {initSciencesAndMethodologies} from '/artikkelit/interfaces/sciencesAndMethodologies.js';
import {initAuthors} from '/artikkelit/interfaces/authors.js';
import {fillFormOptions, fillDatalistOptions, fillArticleTypeOptions} from '/artikkelit/loadData.js';
import {initOntologyWords, ontologyTypeChange} from '/artikkelit/interfaces/ontologyWords.js';
import {initPublicationSearch} from '/artikkelit/interfaces/publicationSearch.js';
import {initReviewSearch} from '/artikkelit/interfaces/reviewSearch.js';
import {} from '/artikkelit/articleUpdate.js';
import {idbClearAllTables} from '/artikkelit/articleReset.js'


/*****************************************************************************/
//INIT

window.initialize = function () {
  console.log('Initializing');

  doLogin(authSuccess);

  function authSuccess(user) {
    const accountMenu = document.getElementById('accountMenu');
    accountMenu.classList.add('show');
    const username = document.querySelector('#accountMenu #username');
    username.innerHTML = Account.get().Name;
    showTab('artikkelit');
    fillFormOptions();
    initTypeChanges();
    initPublicationSearch();
    initArticle();
    initSciencesAndMethodologies();
    initReviewSearch();
    initAuthors();
    initAbstracts();
    initOntologyWords();
    initAdditionalFields();
    addFormChangeListeners();
  }
};

window.onAccount = function (e) {
  console.log('Account:', e);
  idbClearAllTables();
  logout();
};

function initTypeChanges() {
  document.getElementById('kuvailtava-kohde').addEventListener('change', sourceTypeChange);
  document.getElementById('asiasana-ontologia').addEventListener('change', ontologyTypeChange);
  document.getElementById('kuvailtava-kohde').dispatchEvent(new Event('change'));
}

function addFormChangeListeners() {
  const form = document.getElementById('articleForm');
  const buttons = document.querySelectorAll('#articleForm button');

  form.addEventListener('input', function () {
    doUpdate();
  });

  buttons.forEach(button => {
    button.addEventListener('click', function () {
      doUpdate();
    });
  })

}

function sourceTypeChange(event) {
  event.preventDefault();
  fillDatalistOptions();
  fillArticleTypeOptions();

  const sourceType = event.target.value;
  const optionIsbn = document.querySelector(`select#julkaisu-haku-tyyppi option[value='isbn']`);
  const optionIssn = document.querySelector(`select#julkaisu-haku-tyyppi option[value="issn"]`);

  const sourceTypeSelect = document.querySelector('select#kuvailtava-kohde');
  const sourceTypePreview = document.getElementById('sourceTypePreview');

  sourceTypePreview.innerHTML = sourceTypeSelect.options[sourceTypeSelect.selectedIndex].text

  if (sourceType === 'journal') {
    document.getElementById(`numeron-vuosi-wrap`).style.display = 'block';
    document.getElementById(`numeron-vol-wrap`).style.display = 'block';
    document.getElementById(`numeron-numero-wrap`).style.display = 'block';
    document.getElementById(`artikkelin-osasto-toistuva-wrap`).style.display = 'block';
    document.getElementById(`lehden-tunniste-label`).innerHTML = 'ISSN:';
    document.getElementById('lehden-vuodet-label').innerHTML = 'Julkaisuvuodet:';
    optionIsbn.setAttribute('hidden', 'hidden');
    optionIssn.removeAttribute('hidden');
  }

  if (sourceType === 'book') {
    document.getElementById(`numeron-vuosi-wrap`).style.display = 'none';
    document.getElementById(`numeron-vuosi`).value = '';
    document.getElementById(`numeron-vol-wrap`).style.display = 'none';
    document.getElementById(`numeron-vol`).value = '';
    document.getElementById(`numeron-numero-wrap`).style.display = 'none';
    document.getElementById(`numeron-numero`).value = '';
    document.getElementById(`artikkelin-osasto-toistuva-wrap`).style.display = 'none';
    document.getElementById(`lehden-tunniste-label`).innerHTML = 'ISBN:';
    document.getElementById('artikkelin-osasto-toistuva').value = '';
    document.getElementById('lehden-vuodet-label').innerHTML = 'Julkaisuvuosi:';
    optionIssn.setAttribute('hidden', 'hidden');
    optionIsbn.removeAttribute('hidden')
  }
  document.getElementById('julkaisu-haku-tulos-lista').dispatchEvent(new Event('change'));
  doUpdate();
}
