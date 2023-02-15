import {setNavBar} from "/common/ui-utils.js";
import {doLogin} from "/common/auth.js"
import {showTab} from "/common/ui-utils.js";
import {getArtikkeliRecord} from "../common/rest.js";
import {showRecord} from "/common/marc-record-ui.js";
import {idbGet, idbDel, idbGetStoredValues} from "/artikkelit/indexDB.js"
import {initAuthors, refreshAuthorsList, refreshAuthorOrganizationList, resetAuthor} from "/artikkelit/interfaces/authors.js";
import {initAbstracts, refreshAbstractList} from "/artikkelit/interfaces/abstracts.js";
import {initOntologyWords, refreshOntologyWordList} from "/artikkelit/interfaces/ontologyWords.js";
import {fillFormOptions, fillDatalistOptions} from "/artikkelit/interfaces/loadData.js";
import {initArticle, refreshSciencesList, refreshMetodologysList} from "/artikkelit/interfaces/article.js";
import {initAdditionalFields, refreshNotesList, refreshUDKsList, refreshOtherRatingsList} from "/artikkelit/interfaces/additionalFields.js";
import {initPublicationSearch} from "./interfaces/publicationSearch.js";
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
    initAuthors();
    initAbstracts();
    initOntologyWords();
    initAdditionalFields();
  }
}

window.sourceTypeChange = (event) => {
  event.preventDefault();
  fillDatalistOptions();

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
  // filldatalistoptions? tuskin?
  console.log(event.target.value);
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
      otherRatings
    }).then(({record}) => showRecord(record, "record1", {}, 'artikkelit-lisaa'));
  });
}

window.resetAuthor = (event) => {
  resetAuthor(event);
}

function collectFormData() {
  const [iso6391, iso6392b, ui] = document.getElementById('artikkelin-kieli').value.split(';');
  const reviews = [];
  document.getElementsByName("arvosteltu-teos").forEach(el => reviews.push(el.value));
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
      reviews: reviews,
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

window.removeRewievedBook = (event) => {
  event.preventDefault();
  event.target.parentElement.remove();
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
