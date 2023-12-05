import {generateArticleRecord} from '/common/rest.js';
import {showRecord} from '/common/marc-record-ui.js';
import {idbClear, idbGet, idbSet, idbGetStoredValues} from '/artikkelit/indexDB.js';
import {refreshAbstractList} from '/artikkelit/interfaces/abstracts.js';
import {refreshNotesList, refreshOtherTitlesList, refreshUDKsList, refreshOtherRatingsList} from '/artikkelit/interfaces/additionalFields.js';
import {refreshSciencesList, refreshMetodologysList} from '/artikkelit/interfaces/sciencesAndMethodologies.js';
import {refreshAuthorsList, refreshAuthorOrganizationList} from '/artikkelit/interfaces/authors.js';
import {journalTemplate, bookTemplate} from '/artikkelit/constants/index.js';
import {refreshOntologyWordList} from '/artikkelit/interfaces/ontologyWords.js';
import {refreshReviewsList} from '/artikkelit/interfaces/reviewSearch.js';
import {resetCheckAndSave} from '/artikkelit/actions/articleActions.js';


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

export function refreshAllLists() {
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

  function collectReviewsCheck() {
    const articleType = document.getElementById('artikkelin-tyyppi').value;
    const excludeReviews = ['A1', 'A2', 'A3'].some(str => articleType.includes(str));

    if (excludeReviews) {
      idbClear('artoReviews');
    }
  }

};

function setRecordToIndexDB(record) {
  idbSet('artoRecord', 'record', record);
}

function updateRecordPreview(record) {
  showRecord(record, 'previewRecord', {}, 'artikkelit', false);
  showRecord(record, 'dialogRecord', {}, 'artikkelit', false);
  resetCheckAndSave();
}
