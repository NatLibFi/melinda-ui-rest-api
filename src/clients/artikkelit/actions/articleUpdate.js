import {resetCheckAndSave} from '/artikkelit/actions/articleModes.js';
import {journalTemplate, bookTemplate} from '/artikkelit/constants/index.js';
import {refreshAbstractList} from '/artikkelit/interfaces/abstracts.js';
import {refreshNotesList, refreshOtherRatingsList, refreshOtherTitlesList, refreshUDKsList} from '/artikkelit/interfaces/additionalFields.js';
import {refreshAuthorsList, refreshAuthorOrganizationList} from '/artikkelit/interfaces/authors.js';
import {refreshOntologyWordList} from '/artikkelit/interfaces/ontologyWords.js';
import {refreshReviewsList} from '/artikkelit/interfaces/reviewSearch.js';
import {refreshSciencesList, refreshMetodologysList} from '/artikkelit/interfaces/sciencesAndMethodologies.js';
import {idbClear, idbGet, idbSet, idbGetStoredValues} from '/artikkelit/utils/indexedDB.js';
import {showRecord} from '/common/marc-record-ui.js';
import {generateArticleRecord} from '/common/rest.js';


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

  idbClear('artoRecord');

  const storedData = getStoredData();
  const formData = collectFormData();

  Promise.all(storedData)
    .then(([
      abstracts,
      authors,
      metodologys,
      notes,
      ontologyWords,
      otherRatings,
      reviews,
      sciences,
      source,
      udks
    ]) => {
      updateRecord({
        ...formData,
        abstracts,
        authors,
        metodologys,
        notes,
        ontologyWords,
        otherRatings,
        reviews,
        sciences,
        source,
        udks
      })
    })
    .catch((error) => {
      console.log('Error resolving promises: ', error);
    })


  function getStoredData() {

    return [
      idbGetStoredValues('artoAbstracts'),
      idbGetStoredValues('artoAuthors'),
      idbGetStoredValues('artoMetodologys'),
      idbGetStoredValues('artoNotes'),
      idbGetStoredValues('artoOntologyWords'),
      idbGetStoredValues('artoOtherRatings'),
      getReviews(),
      idbGetStoredValues('artoSciences'),
      getSource(),
      idbGetStoredValues('artoUDKs'),
    ];


    function getReviews() {
      collectReviewsCheck();

      return idbGetStoredValues('artoReviews');

      function collectReviewsCheck() {
        const articleType = document.getElementById('artikkelin-tyyppi').value;
        const excludeReviews = ['A1', 'A2', 'A3'].some(str => articleType.includes(str));

        if (excludeReviews) {
          idbClear('artoReviews');
        }
      }
    }

    function getSource() {
      const tietueIndex = document.getElementById('julkaisu-haku-tulos-lista').value;
      const sourceType = document.getElementById('kuvailtava-kohde').value;

      if (tietueIndex !== '') {
        return idbGet('artoSources', parseInt(tietueIndex));
      }

      if (sourceType == 'journal') {
        return journalTemplate;
      }

      if (sourceType == 'book') {
        return bookTemplate;
      }
    }

  }

  
  function updateRecord(articleData) {

    if (!isValid(articleData)) {
      console.log('Article data is not valid for record generation!');
      return;
    }

    generateArticleRecord(articleData)
      .then(({record}) => {
        setRecordToIndexedDb(record);
        updateRecordPreview(record);
      })
      .catch((error) => {
        console.log('Error while generating article record: ', error);
      });

    function isValid(articleData) {
      //console.log('Article data is :', articleData);
      //todo: validate the data here before sending to record generation
      //or validate immediately when user adds data to form inputs
      //or validate whole form fieldsets after user has added data to one form section
      return true;
    }

    function setRecordToIndexedDb(record) {
      idbSet('artoRecord', 'record', record);
    }

    function updateRecordPreview(record) {
      showRecord(record, 'previewRecord', {}, 'artikkelit', false);
      showRecord(record, 'dialogRecord', {}, 'artikkelit', false);
      resetCheckAndSave();
    }
  }

}
