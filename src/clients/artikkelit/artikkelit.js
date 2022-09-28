import {setNavBar, startProcess, stopProcess} from "/common/ui-utils.js";
import {Account, doLogin, logout} from "/common/auth.js"
import {showTab, resetForms, reload} from "/common/ui-utils.js";
import {getArtikkeliRecord, getPublicationByISSN, getPublicationByISBN, getPublicationByTitle, getPublicationByMelinda, getOntologyWords} from "../common/rest.js";
import {showRecord} from "/common/marc-record-ui.js";
import {formToJson} from "/common/ui-utils.js";
import {idbGet, idbSet, idbDel, idbGetStoredValues} from "/artikkelit/indexDB.js"
import {setOptions} from "/artikkelit/utils.js";
import {initAuthors, refreshAuthorsList, refreshAuthorOrganizationList, resetAuthor} from "/artikkelit/interfaces/authors.js";
import {initAbstracts, refreshAbstractList} from "/artikkelit/interfaces/abstracts.js";
import {initOntologyWords, refreshOntologyWordList} from "/artikkelit/interfaces/ontologyWords.js";
import {fillFormOptions, fillDatalistOptions} from "/artikkelit/interfaces/loadData.js";
import {initArticle, refreshSciencesList, refreshMetodologysList} from "/artikkelit/interfaces/article.js";
import {initAdditionalFields, refreshNotesList, refreshUDKsList, refreshOtherRatingsList} from "/artikkelit/interfaces/additionalFields.js";
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
    initArticle();
    initAuthors();
    initAbstracts();
    initOntologyWords();
    initAdditionalFields();

    document.getElementById("julkaisu-haku-title-form").addEventListener("submit", searchPublications);
    document.getElementById("julkaisu-haku-melinda-form").addEventListener("submit", searchPublications);
    document.getElementById("julkaisu-haku-isbn-form").addEventListener("submit", searchPublications);
    document.getElementById("julkaisu-haku-issn-form").addEventListener("submit", searchPublications);

    resetSearchResultSelect();
  }
}

window.sourceTypeChange = (event) => {
  event.preventDefault();
  fillDatalistOptions();

  const sourceType = event.target.value;
  if (sourceType === 'journal') {
    document.getElementById(`numeron-vol-wrap`).style.display = 'block';
    document.getElementById(`numeron-numero-wrap`).style.display = 'block';
    document.getElementById(`artikkelin-osasto-toistuva-wrap`).style.display = 'block';
    document.getElementById(`artikkelin-arvostelu-tyyppi-wrap`).style.display = 'block';
    document.getElementById(`lehden-issn-wrap`).style.display = 'block';
    document.getElementById(`lehden-isbn-wrap`).style.display = 'none';
  }

  if (sourceType === 'book') {
    document.getElementById(`numeron-vol-wrap`).style.display = 'none';
    document.getElementById(`numeron-numero-wrap`).style.display = 'none';
    document.getElementById(`artikkelin-osasto-toistuva-wrap`).style.display = 'none';
    document.getElementById(`artikkelin-arvostelu-tyyppi-wrap`).style.display = 'none';
    document.getElementById(`lehden-issn-wrap`).style.display = 'none';
    document.getElementById(`lehden-isbn-wrap`).style.display = 'block';
  }
}

window.showAndHideSearchInputs = (event) => {
  document.getElementById(`julkaisu-haku-title-form`).style.display = 'none';
  document.getElementById(`julkaisu-haku-issn-form`).style.display = 'none';
  document.getElementById(`julkaisu-haku-isbn-form`).style.display = 'none';
  document.getElementById(`julkaisu-haku-melinda-form`).style.display = 'none';

  // console.log(event.target.value);

  document.getElementById(`julkaisu-haku-${event.target.value}-form`).style.display = 'block';
}

window.ontologySearchResultChange = () => {

}

window.searchResultChange = (event) => {
  if (event.target.value !== '') {
    idbGet('artoSources', parseInt(event.target.value)).then(data => {
      //console.log(data);
      document.getElementById(`lehden-nimi`).innerHTML = data.title;
      document.getElementById(`lehden-melindaId`).innerHTML = data.sourceIds.filter(id => (/^\(FI-MELINDA\)\d{9}$/u).test(id));
      document.getElementById(`lehden-issn`).innerHTML = data.issns;
      document.getElementById(`lehden-isbn`).innerHTML = data.isbns;
      document.getElementById(`lehden-julkaisu-tyyppi`).innerHTML = data.recordType;
      document.getElementById(`lehden-elektroninen-julkaisu`).innerHTML = data.isElectronic ? "Kyllä" : "Ei";
      document.getElementById(`lehden-vuodet-min`).innerHTML = data.publisherInfo.publisherYears.start;
      document.getElementById(`lehden-vuodet-max`).innerHTML = data.publisherInfo.publisherYears.end;
      document.getElementById(`lehden-paikka`).innerHTML = data.publisherInfo.publisherLocation;
    });
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
    }

  };
}

function resetSearchResultSelect(searching) {
  const select = document.getElementById('julkaisu-haku-tulos-lista');
  select.innerHTML = '';
  document.getElementById(`lehden-nimi`).innerHTML = '';
  document.getElementById(`lehden-melindaId`).innerHTML = '';
  document.getElementById(`lehden-issn`).innerHTML = '';
  document.getElementById(`lehden-isbn`).innerHTML = '';
  document.getElementById(`lehden-julkaisu-tyyppi`).innerHTML = '';
  document.getElementById(`lehden-elektroninen-julkaisu`).innerHTML = '';
  document.getElementById(`lehden-vuodet-min`).innerHTML = '';
  document.getElementById(`lehden-vuodet-max`).innerHTML = '';

  if (searching) {
    return setOptions(select, [{value: '', text: 'Etsitään...'}], true);
  }

  setOptions(select, [{value: '', text: 'Ei tuloksia'}], true);
}

function searchPublications(event) {
  event.preventDefault();

  resetSearchResultSelect(true);
  const hakuTyyppi = document.getElementById(`julkaisu-haku-tyyppi`).value;
  const sourceType = document.querySelector('#kuvailtava-kohde').value;
  const formJson = formToJson(event);

  if (hakuTyyppi === 'issn') {
    return getPublicationByISSN(formJson['haku-arvo'], sourceType).then(result => console.log(result));
  }
  if (hakuTyyppi === 'isbn') {
    return getPublicationByISBN(formJson['haku-arvo'], sourceType).then(result => console.log(result));
  }
  if (hakuTyyppi === 'title') {
    return getPublicationByTitle(formJson['haku-arvo'], sourceType).then(result => setRecordsToSearch(result));
  }
  if (hakuTyyppi === 'melinda') {
    return getPublicationByMelinda(formJson['haku-arvo'], sourceType).then(result => console.log(result));
  }

  throw new Error('Invalid search type!');
}

function setRecordsToSearch(records) {
  if (records.length === 0) {
    return resetSearchResultSelect();
  }

  const select = document.getElementById('julkaisu-haku-tulos-lista');
  const data = records.map((record, index) => {
    const title = record.data.title;
    idbSet('artoSources', index, record.data);
    return {value: index, text: title};
  });

  setOptions(select, data);
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
