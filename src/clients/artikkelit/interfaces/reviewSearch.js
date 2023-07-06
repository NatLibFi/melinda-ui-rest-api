import {idbGet, idbClear, idbSet, idbAddValueToLastIndex, idbGetStoredValues} from '/artikkelit/indexDB.js';
import {formToJson, setOptions, createIconButton, createP, showSnackbar} from '/common/ui-utils.js';
import {getBookForReviewByTitle} from '/common/rest.js';

export function initReviewSearch() {
  console.log('initializing review search...');
  document.getElementById('arvosteltu-teos-hae-form').addEventListener('submit', searchPublications);
  document.getElementById('arvosteltu-teos-lisaa-form').addEventListener('submit', addReview);

  document.getElementById('tyhjenna-arvostelut-form').addEventListener('submit', clearReviews);

  document.getElementById('arvosteltu-teos-tulos-lista').addEventListener('change', searchResultChange);

  refreshReviewsList();
  resetSearchResultSelect();
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
    showSnackbar({text: 'Arvostelu ei voi olla tyhjä', closeButton: 'true'});
    return;
  }

  idbGet('artoTempReviews', parseInt(reviewIndex)).then(tempReview => {
    console.log(tempReview);

    idbGetStoredValues('artoReviews').then(reviews => {
      if (reviews.some(review => review.title === tempReview.title || review.sourceIds === tempReview.sourceIds)) {
        showSnackbar({text: 'Artikkelille on jo lisätty tämä arvostelu', closeButton: 'true'});
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
      const removeButton = createIconButton('delete', ['no-border', 'negative'], `return removeReviewedBook(event, ${reviewData.key})`, 'Poista');
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
  event.preventDefault();
  idbClear('artoTempReviews').then(() => {
    resetSearchResultSelect(true);
  });

  const formJson = formToJson(event);

  return getBookForReviewByTitle(formJson['arvosteltu-teos']).then(result => {
    if (result.error === undefined) {
      return setRecordsToSearch(result);
    }

    return resetSearchResultSelect();
  });
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
      const publicationType = record.isElectronic ? 'E-aineisto' : 'Painettu';
      const yearsStart = record.publisherInfo.publisherYears.start;
      const yearsEnd = record.publisherInfo.publisherYears.end ?? '';
      const hyphen = (record.recordType === ('Kausijulkaisu' || 'Päivittyvä julkaisu') ? '-' : '');

      const text = `${title} (${publicationType}: ${yearsStart}${hyphen}${yearsEnd})`;
      return {value: record.key, text};
    });

    setOptions(select, data);
  });
}

export function resetReview(event) {
  event.preventDefault();
  idbClear('artoTempReviews').then(() => {
    document.getElementById('arvosteltu-teos-hae-form').reset();
    resetSearchResultSelect();
  });
}
