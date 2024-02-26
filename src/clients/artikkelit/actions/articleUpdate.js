import {checkArticleForm} from '/artikkelit/actions/articleCheck.js';
import {collectRawFormData, collectStoredFormData} from '/artikkelit/actions/articleCollectFormData.js';
import {resetCheckAndSave} from '/artikkelit/actions/articleReset.js';
import {refreshAbstractList} from '/artikkelit/interfaces/abstracts.js';
import {refreshNotesList, refreshOtherRatingsList, refreshOtherTitlesList, refreshUDKsList} from '/artikkelit/interfaces/additionalFields.js';
import {refreshAuthorsList, refreshAuthorOrganizationList} from '/artikkelit/interfaces/authors.js';
import {refreshOntologyWordList} from '/artikkelit/interfaces/ontologyWords.js';
import {refreshReviewsList} from '/artikkelit/interfaces/reviewSearch.js';
import {refreshSciencesList, refreshMetodologysList} from '/artikkelit/interfaces/sciencesAndMethodologies.js';
import {idbClear, idbSet} from '/artikkelit/utils/indexedDB.js';
import {showRecord} from '/common/marc-record-ui.js';
import {generateArticleRecord} from '/common/rest.js';



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

  const storedFormData = collectStoredFormData();
  const rawFormData = collectRawFormData();

  Promise.all(storedFormData)
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
        ...rawFormData,
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


  function updateRecord(articleData) {

    if (!isValid(articleData)) {
      console.log('Article data is not valid for record generation!');
      return;
    }

    generateArticleRecord(articleData)
      .then(({record}) => {
        setRecordToIndexedDb(record);
        updateRecordPreview(record);
        checkArticleForm();
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
