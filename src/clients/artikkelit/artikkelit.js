import {setNavBar} from "/common/ui-utils.js";
import {doLogin} from "/common/auth.js"
import {showTab} from "/common/ui-utils.js";
import {getArtikkeliRecord} from "../common/rest.js";
import {showRecord} from "/common/marc-record-ui.js";
import {idbGet, idbDel, idbGetStoredValues, idbClear} from "/artikkelit/indexDB.js"
import {initAuthors, refreshAuthorsList, refreshAuthorOrganizationList, resetAuthor} from "/artikkelit/interfaces/authors.js";
import {initAbstracts, refreshAbstractList} from "/artikkelit/interfaces/abstracts.js";
import {initOntologyWords, refreshOntologyWordList} from "/artikkelit/interfaces/ontologyWords.js";
import {fillFormOptions, fillDatalistOptions, fillArticleTypeOptions} from "/artikkelit/interfaces/loadData.js";
import {initArticle, refreshSciencesList, refreshMetodologysList} from "/artikkelit/interfaces/article.js";
import {initAdditionalFields, refreshNotesList, refreshUDKsList, refreshOtherRatingsList} from "/artikkelit/interfaces/additionalFields.js";
import {initPublicationSearch} from "./interfaces/publicationSearch.js";
import {initReviewSearch, resetReview, refreshReviewsList, clearReviews} from "./interfaces/reviewSearch.js";
//import { } from "./interfaces/";

window.initialize = function () {
  console.log('Initializing');
  setNavBar(document.querySelector('#navbar'), "artikkelit");

  doLogin(authSuccess);

  function authSuccess(user) {
    // const username = document.querySelector("#account-menu #username")
    // username.innerHTML = Account.get()["Name"];
    showTab('artikkelit-lisaa');
    fillFormOptions();
    initPublicationSearch();
    initArticle();
    initReviewSearch();
    initAuthors();
    initAbstracts();
    initOntologyWords();
    initAdditionalFields();
  }
}

window.sourceTypeChange = (event) => {
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
  }

  if (sourceType === 'book') {
    document.getElementById(`numeron-vuosi-wrap`).style.display = 'none';
    document.getElementById(`numeron-vol-wrap`).style.display = 'none';
    document.getElementById(`numeron-numero-wrap`).style.display = 'none';
    document.getElementById(`artikkelin-osasto-toistuva-wrap`).style.display = 'none';
    document.getElementById(`artikkelin-arvostelu-tyyppi-wrap`).style.display = 'none';
    document.getElementById(`lehden-tunniste-label`).innerHTML = 'ISBN:';
  }
}

window.articleTypeChange = (event) => {
  const reviewFieldset = document.getElementById("arvostellun-teoksen-tiedot");
  const addedReviews = document.getElementById("arvostellut-teokset");
  const selectedType = event.target.value;
  if (["B1", "B2", "D1", "E1"].some(str => selectedType.includes(str))) {
    reviewFieldset.style.display = "flex";
    addedReviews.style.display = "flex";
  } else {
    reviewFieldset.style.display = "none";
    addedReviews.style.display = "none";
  }
}

window.doUpdate = (event) => {
  event.preventDefault();
  const tietueIndex = document.getElementById('julkaisu-haku-tulos-lista').value;

  if (tietueIndex === '') {
    return false;
  }

  Promise.all([
    idbGet('artoSources', parseInt(tietueIndex)),
    idbGetStoredValues('artoSciences'),
    idbGetStoredValues('artoMetodologys'),
    idbGetStoredValues('artoAuthors'),
    idbGetStoredValues('artoOntologyWords'),
    idbGetStoredValues('artoAbstracts'),
    idbGetStoredValues('artoNotes'),
    idbGetStoredValues('artoUDKs'),
    idbGetStoredValues('artoOtherRatings')
  ]).then(([
    source,
    sciences,
    metodologys,
    authors,
    ontologyWords,
    abstracts,
    notes,
    udks,
    otherRatings
  ]) => {
    const formData = collectFormData();
    const reviews = collectReviews();
    getArtikkeliRecord({
      source,
      ...formData,
      sciences,
      metodologys,
      authors,
      ...reviews,
      ontologyWords,
      abstracts,
      notes,
      udks,
      otherRatings
    }).then(({record}) => showRecord(record, "record1", {}, 'artikkelit-lisaa'));
  });
}

window.resetAuthor = (event) => {
  resetAuthor(event);
}

window.resetReview = (event) => {
  resetReview(event);
}

function collectFormData() {
  const [iso6391, iso6392b, ui] = document.getElementById('artikkelin-kieli').value.split(';');
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
      link: document.getElementById(`artikkelin-linkki`).value,
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

function collectReviews() {
  const articleType = document.getElementById("artikkelin-tyyppi").value;
  const includeReviews = ["B1", "B2", "D1", "E1"].some(str => articleType.includes(str));
  if (!includeReviews) {
    // clearReviews();
    idbClear("artoReviews").then(() => refreshReviewsList());
  }
  return idbGetStoredValues("artoReviews");
}

window.removeReviewedBook = (event, key) => {
  event.preventDefault();
  idbDel("artoReviews", key).then(() => refreshReviewsList());
}

window.removeScience = (event, key) => {
  event.preventDefault();
  idbDel('artoSciences', key).then(() => refreshSciencesList());
}

window.removeMetodology = (event, key) => {
  event.preventDefault();
  idbDel('artoMetodologys', key).then(() => refreshMetodologysList());
}

window.removeAuthor = (event, key) => {
  event.preventDefault();
  idbDel('artoAuthors', key).then(() => refreshAuthorsList());
}

window.removeOrgForAuthor = (event, key) => {
  event.preventDefault();
  idbDel('artoAuthorTempOrg', key).then(() => refreshAuthorOrganizationList());
}

window.removeAbstract = (event, key) => {
  event.preventDefault();
  idbDel('artoAbstracts', key).then(() => refreshAbstractList());
}

window.removeOntologyWord = (event, key) => {
  event.preventDefault();
  idbDel('artoOntologyWords', key).then(() => refreshOntologyWordList());
}

window.removeNote = (event, key) => {
  event.preventDefault();
  idbDel('artoNotes', key).then(() => refreshNotesList());
}

window.removeUDK = (event, key) => {
  event.preventDefault();
  idbDel('artoUDKs', key).then(() => refreshUDKsList());
}

window.removeotherRating = (event, key) => {
  event.preventDefault();
  idbDel('artoOtherRatings', key).then(() => refreshOtherRatingsList());
}
