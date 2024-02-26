import {journalTemplate, bookTemplate} from '/artikkelit/constants/index.js';
import {idbClear, idbGet, idbGetStoredValues} from '/artikkelit/utils/indexedDB.js';


export function collectRawFormData() {
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



export function collectStoredFormData() {

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

