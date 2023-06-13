import {setNavBar, showTab} from '/common/ui-utils.js';
import {Account, doLogin, logout} from '/common/auth.js';
import {getArtikkeliRecord} from '../common/rest.js';
import {showRecord} from '/common/marc-record-ui.js';
import {idbGet, idbDel, idbGetStoredValues, idbClear, getTableNames} from '/artikkelit/indexDB.js';
import {initAuthors, refreshAuthorsList, refreshAuthorOrganizationList, resetAuthor} from '/artikkelit/interfaces/authors.js';
import {initAbstracts, refreshAbstractList} from '/artikkelit/interfaces/abstracts.js';
import {initOntologyWords, refreshOntologyWordList, resetOntologySelect} from '/artikkelit/interfaces/ontologyWords.js';
import {fillFormOptions, fillDatalistOptions, fillArticleTypeOptions} from '/artikkelit/interfaces/loadData.js';
import {initArticle, refreshSciencesList, refreshMetodologysList} from '/artikkelit/interfaces/article.js';
import {initAdditionalFields, refreshNotesList, refreshOtherTitlesList, refreshUDKsList, refreshOtherRatingsList} from '/artikkelit/interfaces/additionalFields.js';
import {initReviewSearch, resetReview, refreshReviewsList, clearReviews} from './interfaces/reviewSearch.js';
import {initPublicationSearch, resetSearchResultSelect} from './interfaces/publicationSearch.js';
import {journalTemplate, bookTemplate} from './interfaces/constants.js';
//import { } from "./interfaces/";

window.initialize = function () {
  console.log('Initializing');
  setNavBar(document.querySelector('#navbar'), 'artikkelit');

  doLogin(authSuccess);

  function authSuccess(user) {
    const username = document.querySelector('#account-menu #username');
    username.innerHTML = Account.get().Name;
    showTab('artikkelit-lisaa');
    initTypeChanges();
    fillFormOptions();
    initPublicationSearch();
    initArticle();
    initReviewSearch();
    initAuthors();
    initAbstracts();
    initOntologyWords();
    initAdditionalFields();
  }
};

function initTypeChanges() {
  document.getElementById('kuvailtava-kohde').addEventListener('change', sourceTypeChange);
  document.getElementById('asiasana-ontologia').addEventListener('change', ontologyTypeChange);
}

function sourceTypeChange(event) {
  event.preventDefault();
  fillDatalistOptions();
  fillArticleTypeOptions();

  const sourceType = event.target.value;
  if (sourceType === 'journal') {
    document.getElementById(`numeron-vuosi-wrap`).style.display = 'block';
    document.getElementById(`numeron-vol-wrap`).style.display = 'block';
    document.getElementById(`numeron-numero-wrap`).style.display = 'block';
    document.getElementById(`artikkelin-osasto-toistuva-wrap`).style.display = 'block';
    document.getElementById(`artikkelin-arvostelu-tyyppi-wrap`).style.display = 'block';
    document.getElementById(`lehden-tunniste-label`).innerHTML = 'ISSN:';
    document.getElementById('lehden-vuodet-min-label').innerHTML = 'Julkaisuvuodet:';
    document.getElementById('lehden-vuodet-valiviiva').style.display = 'block';
    document.getElementById('lehden-vuodet-max').style.display = 'block';
  }

  if (sourceType === 'book') {
    document.getElementById(`numeron-vuosi-wrap`).style.display = 'none';
    document.getElementById(`numeron-vol-wrap`).style.display = 'none';
    document.getElementById(`numeron-numero-wrap`).style.display = 'none';
    document.getElementById(`artikkelin-osasto-toistuva-wrap`).style.display = 'none';
    document.getElementById(`artikkelin-arvostelu-tyyppi-wrap`).style.display = 'none';
    document.getElementById(`lehden-tunniste-label`).innerHTML = 'ISBN:';
    document.getElementById('artikkelin-osasto-toistuva').value = '';
    document.getElementById('artikkelin-arvostelu-tyyppi').value = '';
    document.getElementById('lehden-vuodet-min-label').innerHTML = 'Julkaisuvuosi:';
    document.getElementById('lehden-vuodet-valiviiva').style.display = 'none';
    document.getElementById('lehden-vuodet-max').style.display = 'none';

  }
}

window.articleTypeChange = (event) => {
  const reviewFieldset = document.getElementById('arvostellun-teoksen-tiedot');
  const addedReviews = document.getElementById('arvostellut-teokset');
  const selectedType = event.target.value;
  if (['B1', 'B2', 'D1', 'E1'].some(str => selectedType.includes(str))) {
    reviewFieldset.style.display = 'flex';
    addedReviews.style.display = 'flex';
  } else {
    reviewFieldset.style.display = 'none';
    addedReviews.style.display = 'none';
  }
};

function ontologyTypeChange(event) {
  event.preventDefault();

  const ontologyType = event.target.value;
  if ((/other/).test(ontologyType)) {
    document.getElementById('haku-osio').style.display = 'none';
    document.getElementById('asiasana-lisaa-select').style.display = 'none';
    document.getElementById('asiasana-lisaa-input').style.display = 'flex';
    const opts = event.target.options;
    document.getElementById('asiasana-muu-label').innerHTML = `${opts[opts.selectedIndex].text}:`;
    resetOntologySelect();
  } else {
    document.getElementById('haku-osio').style.display = 'flex';
    document.getElementById('asiasana-lisaa-select').style.display = 'flex';
    document.getElementById('asiasana-lisaa-input').style.display = 'none';
    document.getElementById('asiasana-muu-label').innerHTML = '';
    document.getElementById('asiasana-muu').value = '';
  }
}

window.doUpdate = (event) => {
  event.preventDefault();
  const tietueIndex = document.getElementById('julkaisu-haku-tulos-lista').value;

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
    getArtikkeliRecord({
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
    }).then(({record}) => showRecord(record, 'record1', {}, 'artikkelit-lisaa'));
  });
};

window.resetAuthor = (event) => {
  resetAuthor(event);
};

window.resetReview = (event) => {
  resetReview(event);
};

function collectReviewsCheck() {
  const articleType = document.getElementById('artikkelin-tyyppi').value;
  const includeReviews = ['B1', 'B2', 'D1', 'E1'].some(str => articleType.includes(str));
  if (!includeReviews) {
    idbClear('artoReviews').then(() => refreshReviewsList());
  }
}

function collectFormData() {
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
      reviewType: document.getElementById(`artikkelin-arvostelu-tyyppi`).value,
      sectionOrColumn: document.getElementById(`artikkelin-osasto-toistuva`).value
    },
    collecting: {
      f589a: document.getElementById(`poimintatiedot-poimintakoodi598a`).value,
      f599a: document.getElementById(`poimintatiedot-poimintakoodi599a`).value,
      f599x: document.getElementById(`poimintatiedot-poimintakoodi599x`).value
    }
  };
}

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

window.removeReviewedBook = (event, key) => {
  event.preventDefault();
  idbDel('artoReviews', key).then(() => refreshReviewsList());
};

window.removeArticleLink = (event) => {
  event.preventDefault();
  event.target.parentElement.remove();
};

window.removeScience = (event, key) => {
  event.preventDefault();
  idbDel('artoSciences', key).then(() => refreshSciencesList());
};

window.removeMetodology = (event, key) => {
  event.preventDefault();
  idbDel('artoMetodologys', key).then(() => refreshMetodologysList());
};

window.removeAuthor = (event, key) => {
  event.preventDefault();
  idbDel('artoAuthors', key).then(() => refreshAuthorsList());
};

window.removeOrgForAuthor = (event, key) => {
  event.preventDefault();
  idbDel('artoAuthorTempOrg', key).then(() => refreshAuthorOrganizationList());
};

window.removeAbstract = (event, key) => {
  event.preventDefault();
  idbDel('artoAbstracts', key).then(() => refreshAbstractList());
};

window.removeOntologyWord = (event, key) => {
  event.preventDefault();
  idbDel('artoOntologyWords', key).then(() => refreshOntologyWordList());
};

window.removeNote = (event, key) => {
  event.preventDefault();
  idbDel('artoNotes', key).then(() => refreshNotesList());
};

window.removeOtherTitle = (event, key) => {
  event.preventDefault();
  idbDel('artoOtherTitles', key).then(() => refreshOtherTitlesList());
};

window.removeUDK = (event, key) => {
  event.preventDefault();
  idbDel('artoUDKs', key).then(() => refreshUDKsList());
};

window.removeotherRating = (event, key) => {
  event.preventDefault();
  idbDel('artoOtherRatings', key).then(() => refreshOtherRatingsList());
};

window.onAccount = function (e) {
  console.log('Account:', e);
  idbClearAllTables();
  logout();
};

window.clearAllFields = function () {
  idbClearAllTables();
  refreshAllLists();
  resetSearchResultSelect();
  resetInputFields();
  resetTextareaFields();
  resetSelectFields();
};
