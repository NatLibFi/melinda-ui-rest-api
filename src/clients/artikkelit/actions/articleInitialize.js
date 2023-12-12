import {fillFormOptions} from '/artikkelit/actions/articleFillOptions.js';
import {initAbstracts} from '/artikkelit/interfaces/abstracts.js';
import {initAdditionalFields} from '/artikkelit/interfaces/additionalFields.js';
import {initArticleBasicDetails, sourceTypeChange} from '/artikkelit/interfaces/articleBasic.js';
import {initAuthors} from '/artikkelit/interfaces/authors.js';
import {initOntologyWords} from '/artikkelit/interfaces/ontologyWords.js';
import {initPublicationSearch} from '/artikkelit/interfaces/publicationSearch.js';
import {initReviewSearch} from '/artikkelit/interfaces/reviewSearch.js';
import {initSciencesAndMethodologies} from '/artikkelit/interfaces/sciencesAndMethodologies.js';


export function initArticleForm() {
  fillFormOptions();
  initSourceTypeChange();
  initInterfaces();
  addFormChangeListeners();
}

function addFormChangeListeners() {
  const form = document.getElementById('articleForm');

  form.addEventListener('input', function () {
    doUpdate();
  });

}

function initInterfaces() {
  initPublicationSearch();
  initArticleBasicDetails();
  initSciencesAndMethodologies();
  initReviewSearch();
  initAuthors();
  initAbstracts();
  initOntologyWords();
  initAdditionalFields();
}

function initSourceTypeChange() {
  document.getElementById('kuvailtava-kohde').addEventListener('change', sourceTypeChange);
  document.getElementById('kuvailtava-kohde').dispatchEvent(new Event('change'));
}
