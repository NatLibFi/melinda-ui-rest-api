import {showSnackbar, showTab} from '/common/ui-utils.js';
import {Account, doLogin, logout} from '/common/auth.js';
import {generateArticleRecord} from '/common/rest.js';
import {showRecord} from '/common/marc-record-ui.js';
import {
  idbClear, idbDel, idbGet, idbSet,
  idbGetStoredValues, getTableNames
} from '/artikkelit/indexDB.js';
import {} from './articleActions.js';

import {initAbstracts, refreshAbstractList} from '/artikkelit/interfaces/abstracts.js';
import {
  initAdditionalFields, refreshNotesList, refreshOtherTitlesList,
  refreshUDKsList, refreshOtherRatingsList
} from '/artikkelit/interfaces/additionalFields.js';

import {initArticle, resetAndHideCcLicense} from '/artikkelit/interfaces/article.js';
import {initSciencesAndMethodologies, refreshSciencesList, refreshMetodologysList} from '/artikkelit/interfaces/sciencesAndMethodologies.js';

import {initAuthors, refreshAuthorsList, refreshAuthorOrganizationList, resetAuthor} from '/artikkelit/interfaces/authors.js';
import {journalTemplate, bookTemplate} from '/artikkelit/constants/index.js';
import {fillFormOptions, fillDatalistOptions, fillArticleTypeOptions} from '/artikkelit/loadData.js';
import {initOntologyWords, ontologyTypeChange, refreshOntologyWordList} from '/artikkelit/interfaces/ontologyWords.js';
import {initPublicationSearch, resetPublicationSearchResultSelect} from '/artikkelit/interfaces/publicationSearch.js';
import {initReviewSearch, resetReviewSearchResultSelect, refreshReviewsList} from '/artikkelit/interfaces/reviewSearch.js';
import {resetCheckAndSave} from './articleActions.js';


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

/*****************************************************************************/
//UPDATE

function updateRecordPreview(record) {
  showRecord(record, 'previewRecord', {}, 'artikkelit', false);
  showRecord(record, 'dialogRecord', {}, 'artikkelit', false);
  resetCheckAndSave();
}

window.doUpdate = (event) => {
  event?.preventDefault();
  const tietueIndex = document.getElementById('julkaisu-haku-tulos-lista').value;

  idbClear('artoRecord');
  collectReviewsCheck();

  const promises = [
    idbGetStoredValues('artoSciences'),
    idbGetStoredValues('artoMetodologys'),
    idbGetStoredValues('artoAuthors'),
    idbGetStoredValues('artoOntologyWords'),
    idbGetStoredValues('artoAbstracts'),
    idbGetStoredValues('artoNotes'),
    idbGetStoredValues('artoUDKs'),
    idbGetStoredValues('artoOtherRatings'),
    idbGetStoredValues('artoReviews')
  ];

  if (tietueIndex === '') {
    const sourceType = document.getElementById('kuvailtava-kohde').value;
    if (sourceType == 'journal') {
      promises.unshift(journalTemplate);
    }
    if (sourceType == 'book') {
      promises.unshift(bookTemplate);
    }
  } else {
    promises.unshift(idbGet('artoSources', parseInt(tietueIndex)));
  }

  Promise.all(promises).then(([
    source,
    sciences,
    metodologys,
    authors,
    ontologyWords,
    abstracts,
    notes,
    udks,
    otherRatings,
    reviews
  ]) => {
    const formData = collectFormData();
    generateArticleRecord({
      source,
      ...formData,
      sciences,
      metodologys,
      authors,
      ontologyWords,
      abstracts,
      notes,
      udks,
      otherRatings,
      reviews
    })
      .then(({record}) => {
        setRecordToIndexDB(record);
        updateRecordPreview(record);
      })
      .catch((error) => {
        console.log('Error while generating article record: ', error);
      });
  });
};


/*****************************************************************************/
//COLLECT

function collectReviewsCheck() {
  const articleType = document.getElementById('artikkelin-tyyppi').value;
  const excludeReviews = ['A1', 'A2', 'A3'].some(str => articleType.includes(str));

  if (excludeReviews) {
    idbClear('artoReviews');
  }
}

export function collectFormData() {
  const [iso6391, iso6392b, ui] = document.getElementById('artikkelin-kieli').value.split(';');
  const links = [];
  document.getElementsByName('artikkelin-linkki').forEach(el => links.push(el.value));

  return {
    journalNumber: {
      publishingYear: document.getElementById(`numeron-vuosi`).value,
      volume: document.getElementById(`numeron-vol`).value,
      number: document.getElementById(`numeron-numero`).value,
      pages: document.getElementById(`numeron-sivut`).value
    },
    article: {
      title: document.getElementById(`artikkelin-otsikko`).value,
      titleOther: document.getElementById(`artikkelin-muu-nimeke`).value,
      language: {iso6391, iso6392b, ui},
      link: links,
      type: document.getElementById(`artikkelin-tyyppi`).value,
      sectionOrColumn: document.getElementById(`artikkelin-osasto-toistuva`).value,
      ccLicense: document.getElementById(`artikkelin-cc-lisenssi`).value
    },
    collecting: {
      f589a: document.getElementById(`poimintatiedot-poimintakoodi598a`).value,
      f599a: document.getElementById(`poimintatiedot-poimintakoodi599a`).value,
      f599x: document.getElementById(`poimintatiedot-poimintakoodi599x`).value
    }
  };
}

function setRecordToIndexDB(record) {
  idbSet('artoRecord', 'record', record);
}


/*****************************************************************************/
//RESET

function idbClearAllTables() {
  for (const tableName of getTableNames()) {
    idbClear(tableName);
  }
}

function refreshAllLists() {
  refreshAbstractList();
  refreshAuthorOrganizationList();
  refreshAuthorsList();
  refreshMetodologysList();
  refreshNotesList();
  refreshOtherTitlesList();
  refreshOntologyWordList();
  refreshOtherRatingsList();
  refreshSciencesList();
  refreshUDKsList();
  refreshReviewsList();
}

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


/*****************************************************************************/
//AUTHOR

window.resetAuthor = (event) => {
  resetAuthor(event);
};

window.removeAuthor = (event, key) => {
  event.preventDefault();
  idbDel('artoAuthors', key).then(() => refreshAuthorsList());
};

window.removeOrgForAuthor = (event, key) => {
  event.preventDefault();
  idbDel('artoAuthorTempOrg', key).then(() => refreshAuthorOrganizationList());
};

window.articleAuthorRoleChange = (event) => {
  const authorFirstName = document.getElementById('input-tekija-etunimi');
  const authorLastName = document.getElementById('input-tekija-sukunimi');
  const authorCorporateName = document.getElementById('input-tekija-yhteison-nimi');

  const selectedRole = event.target.value;

  authorFirstName.style.display = 'flex';
  authorLastName.style.display = 'flex';
  authorCorporateName.style.display = 'none';


  if (selectedRole === 'yhteisö') {
    authorFirstName.style.display = 'none';
    authorLastName.style.display = 'none';
    authorCorporateName.style.display = 'flex';
  }
};
