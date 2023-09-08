import {idbGet, idbClear, idbSet, idbAddValueToLastIndex, idbGetStoredValues} from '/artikkelit/indexDB.js';
import {formToJson, setOptions, createIconButton, createP, showSnackbar, startProcess, stopProcess} from '/common/ui-utils.js';
import {getPublicationByTitle, getPublicationByMelindaId, getPublicationByISBN, getPublicationByISSN} from '/common/rest.js';
import {sortRecordData} from '/artikkelit/utils.js';

export function initReviewSearch() {
  console.log('initializing review search...');

  document.getElementById('arvosteltu-teos-haku-tyyppi').addEventListener('change', showAndHideSearchInputs);
  document.getElementById('arvosteltu-teos-tulos-lista').addEventListener('change', searchResultChange);

  document.getElementById('arvosteltu-teos-haku-title-form').addEventListener('submit', searchPublications);
  document.getElementById('arvosteltu-teos-haku-melinda-form').addEventListener('submit', searchPublications);
  document.getElementById('arvosteltu-teos-haku-isbn-form').addEventListener('submit', searchPublications);
  document.getElementById('arvosteltu-teos-haku-issn-form').addEventListener('submit', searchPublications);
  document.getElementById('arvosteltu-teos-lisaa-form').addEventListener('submit', addReview);
  document.getElementById('tyhjenna-arvostelut-form').addEventListener('submit', clearReviews);

  document.getElementById('arvosteltu-teos-haku-tyyppi').dispatchEvent(new Event('change'));
  refreshReviewsList();
  resetSearchResultSelect();
}

export function showAndHideSearchInputs(event) {
  document.getElementById(`arvosteltu-teos-haku-title-form`).style.display = 'none';
  document.getElementById(`arvosteltu-teos-haku-issn-form`).style.display = 'none';
  document.getElementById(`arvosteltu-teos-haku-isbn-form`).style.display = 'none';
  document.getElementById(`arvosteltu-teos-haku-melinda-form`).style.display = 'none';

  //console.log('Valittu hakutyyppi (nimeke, melinda, isbn, issn): ', event.target.value);

  document.getElementById(`arvosteltu-teos-haku-${event.target.value}-form`).style.display = 'block';

  document.querySelector(`select#arvosteltu-teos-haku-tyyppi option[value='issn']`).setAttribute('hidden', 'hidden');;
}

export function searchResultChange(event) {
  if (event.target.value !== '') {
    idbGet('artoTempReviews', parseInt(event.target.value)).then(data => {
      const [melindaId] = data.sourceIds.filter(id => (/^\(FI-MELINDA\)\d{9}$/u).test(id));
      document.getElementById('teoksen-nimi').innerHTML = data.title;
      document.getElementById('teoksen-julkaisija').innerHTML = data.publisherInfo.publisher;
      document.getElementById('teoksen-melindaId').innerHTML = melindaId.replace('(FI-MELINDA)', '');
      document.getElementById('teoksen-tunniste').innerHTML = data.isbns;
      document.getElementById('teoksen-julkaisu-tyyppi').innerHTML = data.recordType;
      document.getElementById('teoksen-elektroninen-julkaisu').innerHTML = data.isElectronic ? 'Kyllä' : 'Ei';
      document.getElementById('teoksen-vuosi').innerHTML = data.publisherInfo.publisherYears.start;
      document.getElementById('teoksen-paikka').innerHTML = data.publisherInfo.publisherLocation;
    });
  }
}

export function addReview(event) {
  event.preventDefault();
  const reviewIndex = document.getElementById('arvosteltu-teos-tulos-lista').value;

  if (reviewIndex === '') {
    showSnackbar({style: 'alert', text: 'Arvostelu ei voi olla tyhjä'});
    return;
  }

  idbGet('artoTempReviews', parseInt(reviewIndex)).then(tempReview => {
    console.log(tempReview);

    idbGetStoredValues('artoReviews').then(reviews => {
      if (reviews.some(review => review.title === tempReview.title || review.sourceIds === tempReview.sourceIds)) {
        showSnackbar({style: 'alert', text: 'Artikkelille on jo lisätty tämä arvostelu'});
        return;
      }

      idbAddValueToLastIndex('artoReviews', tempReview).then(() => {
        refreshReviewsList();
      });
    });
  });
}

export function refreshReviewsList() {
  const reviewList = document.getElementById('arvostelut-list');
  reviewList.innerHTML = '';

  idbGetStoredValues('artoReviews').then(reviews => {
    reviews.forEach(reviewData => {
      // console.log(reviewData)
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('delete_outline', ['alternate-red', 'small'], `return removeReviewedBook(event, ${reviewData.key})`, 'Poista');
      div.appendChild(createP('Arvosteltu teos', '', ':&nbsp', ['label-text']));
      div.appendChild(createP(reviewData.title));
      div.appendChild(createP('ISBN', ',&nbsp', '&nbsp'));
      div.appendChild(createP(reviewData.isbns));

      div.appendChild(removeButton);
      form.appendChild(div);
      reviewList.appendChild(form);
    });

    if (reviews.length > 1) {
      document.getElementById('tyhjenna-arvostelut-form').style.display = 'block';
    }

    if (reviews.length < 2) {
      document.getElementById('tyhjenna-arvostelut-form').style.display = 'none';
    }
  });
}

export function clearReviews(event) {
  event.preventDefault();
  idbClear('artoReviews').then(() => refreshReviewsList());
}

function resetSearchResultSelect(searching) {
  const select = document.getElementById('arvosteltu-teos-tulos-lista');
  select.innerHTML = '';
  document.getElementById('teoksen-nimi').innerHTML = '';
  document.getElementById('teoksen-melindaId').innerHTML = '';
  document.getElementById('teoksen-tunniste').innerHTML = '';
  document.getElementById('teoksen-julkaisija').innerHTML = '';
  document.getElementById('teoksen-paikka').innerHTML = '';
  document.getElementById('teoksen-julkaisu-tyyppi').innerHTML = '';
  document.getElementById('teoksen-elektroninen-julkaisu').innerHTML = '';
  document.getElementById('teoksen-vuosi').innerHTML = '';

  if (searching) {
    return setOptions(select, [{value: '', text: 'Etsitään...'}], true);
  }

  setOptions(select, [{value: '', text: 'Ei tuloksia'}], true);
}

function searchPublications(event) {
  startProcess();
  event.preventDefault();
  idbClear('artoTempReviews').then(() => {
    resetSearchResultSelect(true);
  });

  const collectionFilters = {
    arto: true,
    fennica: true,
    melinda: false
  };

  const searchType = document.getElementById(`arvosteltu-teos-haku-tyyppi`).value;
  const sourceType = 'book'
  const formJson = formToJson(event);
  console.log(formJson)

  if (searchType === 'title') {
    return getPublicationByTitle(formJson['arvosteltu-teos'], collectionFilters, sourceType)
      .then(result => {
        setRecordsToSearch(result);
      })
      .catch(error => {
        resetSearchResultSelect();
        showSnackbar({style: 'alert', text: 'Valitettavasti tällä nimikkeellä ei löytynyt arvosteltuja tietueita!'});
        console.log('Error while trying to get review book by title', error);
      })
      .finally(() => stopProcess());
  }

  if (searchType === 'melinda') {
    return getPublicationByMelindaId(formJson['arvosteltu-teos'], collectionFilters, sourceType)
      .then(result => {
        setRecordsToSearch(result);
      })
      .catch(error => {
        resetSearchResultSelect();
        showSnackbar({style: 'alert', text: 'Valitettavasti tällä Melinda-ID:llä ei löytynyt arvosteltavaa tietuetta!'});
        console.log('Error while trying to get review book by Melinda ID', error);
      })
      .finally(() => stopProcess());
  }

  if (searchType === 'isbn') {
    return getPublicationByISBN(formJson['arvosteltu-teos'], collectionFilters, sourceType)
      .then(result => {
        setRecordsToSearch(result);
      })
      .catch(error => {
        resetSearchResultSelect();
        showSnackbar({style: 'alert', text: 'Valitettavasti tällä ISBN:llä ei löytynyt arvosteltavaa tietuetta!'});
        console.log('Error while trying to get review book by ISBN', error);
      })
      .finally(() => stopProcess());
  }

  if (searchType === 'issn') {
    return getPublicationByISSN(formJson['arvosteltu-teos'], collectionFilters, sourceType)
      .then(result => {
        setRecordsToSearch(result);
      })
      .catch(error => {
        resetSearchResultSelect();
        showSnackbar({style: 'alert', text: 'Valitettavasti tällä ISSN:llä ei löytynyt arvosteltavaa tietuetta!'});
        console.log('Error while trying to get review book by ISSN', error);
      })
      .finally(() => stopProcess());
  }

  throw new Error('Invalid search type!');
}

function setRecordsToSearch(records) {
  if (records.length === 0) {
    return resetSearchResultSelect();
  }

  const promises = records.map((record, index) => {
    console.log(record.data.title);
    return idbSet('artoTempReviews', index, record.data);
  });

  Promise.all(promises).then(() => refreshSearchResultSelect());
}

function refreshSearchResultSelect() {
  const select = document.getElementById('arvosteltu-teos-tulos-lista');
  select.innerHTML = '';

  idbGetStoredValues('artoTempReviews').then(sources => {
    const data = sources.map(record => {
      const {title} = record;
      const publicationType = record.isElectronic ? 'e-aineisto' : 'painettu';
      const yearsStart = record.publisherInfo.publisherYears.start;
      const yearsEnd = record.publisherInfo.publisherYears.end ?? '';
      const hyphen = (record.recordType === ('Kausijulkaisu' || 'Päivittyvä julkaisu') ? '-' : '');

      const text = `${title} (${publicationType}: ${yearsStart}${hyphen}${yearsEnd})`;
      return {value: record.key, text};
    });

    const searchString = (document.getElementById('arvosteltu-teos-haku-tyyppi').value === 'title')
      ? document.getElementById('arvosteltu-teos-haku-title').value.toLowerCase()
      : ''

    const sortedData = sortRecordData(searchString, data);
    return setOptions(select, sortedData);
  });
}

export function resetReview(event) {
  event.preventDefault();
  idbClear('artoTempReviews').then(() => {
    document.getElementById('arvosteltu-teos-haku-title-form').reset();
    document.getElementById('arvosteltu-teos-haku-melinda-form').reset();
    document.getElementById('arvosteltu-teos-haku-isbn-form').reset();
    document.getElementById('arvosteltu-teos-haku-issn-form').reset();
    const searchTypeSelect = document.getElementById('arvosteltu-teos-haku-tyyppi');
    searchTypeSelect.selectedIndex = 0;
    searchTypeSelect.dispatchEvent(new Event('change'));
    resetSearchResultSelect();
  });
}
