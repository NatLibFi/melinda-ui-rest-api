import {getPublicationByISSN, getPublicationByISBN, getPublicationByTitle, getPublicationByMelindaId} from '/common/rest.js';
import {idbGet, idbClear, idbSet, idbGetStoredValues} from '/artikkelit/indexDB.js';
import {formToJson, setOptions} from '/common/ui-utils.js';
import {showCcLicense, resetAndHideCcLicense} from '/artikkelit/interfaces/article.js';

export function initPublicationSearch(event) {
  console.log('initializing publication search...');

  document.getElementById('julkaisu-haku-tyyppi').addEventListener('change', showAndHideSearchInputs);
  document.getElementById('julkaisu-haku-tulos-lista').addEventListener('change', searchResultChange);

  document.getElementById('julkaisu-haku-tyyppi').dispatchEvent(new Event('change'));

  document.getElementById('julkaisu-haku-title-form').addEventListener('submit', searchPublications);
  document.getElementById('julkaisu-haku-melinda-form').addEventListener('submit', searchPublications);
  document.getElementById('julkaisu-haku-isbn-form').addEventListener('submit', searchPublications);
  document.getElementById('julkaisu-haku-issn-form').addEventListener('submit', searchPublications);

  resetSearchResultSelect();
}

export function showAndHideSearchInputs(event) {
  document.getElementById(`julkaisu-haku-title-form`).style.display = 'none';
  document.getElementById(`julkaisu-haku-issn-form`).style.display = 'none';
  document.getElementById(`julkaisu-haku-isbn-form`).style.display = 'none';
  document.getElementById(`julkaisu-haku-melinda-form`).style.display = 'none';

  // console.log(event.target.value);

  document.getElementById(`julkaisu-haku-${event.target.value}-form`).style.display = 'block';
}

export function searchResultChange(event) {
  const searchType = document.getElementById(`kuvailtava-kohde`).value;

  if (event.target.value !== '') {
    idbGet('artoSources', parseInt(event.target.value)).then(data => {
      console.log(data);
      const [melindaId] = data.sourceIds.filter(id => (/^\(FI-MELINDA\)\d{9}$/u).test(id));
      document.getElementById(`lehden-nimi`).innerHTML = data.title;
      document.getElementById(`lehden-julkaisija`).innerHTML = data.publisherInfo.publisher;
      document.getElementById(`lehden-melindaId`).innerHTML = melindaId.replace('(FI-MELINDA)', '');

      if (searchType === 'journal') {
        document.getElementById(`lehden-tunniste`).innerHTML = data.issns;
        document.getElementById(`lehden-vuodet`).innerHTML = data.publisherInfo.publisherYears.start + '-' + data.publisherInfo.publisherYears.end;
      }

      if (searchType === 'book') {
        document.getElementById(`lehden-tunniste`).innerHTML = data.isbns;
        document.getElementById(`lehden-vuodet`).innerHTML = data.publisherInfo.publisherYears.start
      }

      document.getElementById(`lehden-julkaisu-tyyppi`).innerHTML = data.recordType;

      data.isElectronic
        ? (document.getElementById(`lehden-elektroninen-julkaisu`).innerHTML = 'Kyllä', showCcLicense())
        : (document.getElementById(`lehden-elektroninen-julkaisu`).innerHTML = 'Ei', resetAndHideCcLicense())

      document.getElementById(`lehden-paikka`).innerHTML = data.publisherInfo.publisherLocation;
    });
  }
}

export function resetSearchResultSelect(searching) {
  const select = document.getElementById('julkaisu-haku-tulos-lista');
  select.innerHTML = '';
  document.getElementById(`lehden-nimi`).innerHTML = '';
  document.getElementById(`lehden-melindaId`).innerHTML = '';
  document.getElementById(`lehden-tunniste`).innerHTML = '';
  document.getElementById(`lehden-julkaisija`).innerHTML = '';
  document.getElementById(`lehden-paikka`).innerHTML = '';
  document.getElementById(`lehden-julkaisu-tyyppi`).innerHTML = '';
  document.getElementById(`lehden-elektroninen-julkaisu`).innerHTML = '';
  document.getElementById(`lehden-vuodet`).innerHTML = '';

  if (searching) {
    return setOptions(select, [{value: '', text: 'Etsitään...'}], true);
  }

  setOptions(select, [{value: '', text: 'Ei tuloksia'}], true);
}

function searchPublications(event) {
  event.preventDefault();
  idbClear('artoSources').then(() => {
    resetSearchResultSelect(true);
  });

  const hakuTyyppi = document.getElementById(`julkaisu-haku-tyyppi`).value;
  const sourceType = document.querySelector('#kuvailtava-kohde').value;
  const collectionFilter = document.getElementById('julkaisu-haku-rajaus').value;

  const collectionFilters = {
    arto: collectionFilter.includes('arto'),
    fennica: collectionFilter.includes('fennica'),
    melinda: collectionFilter.includes('melinda')
  };

  const formJson = formToJson(event);

  if (hakuTyyppi === 'title') {
    return getPublicationByTitle(formJson['haku-arvo'], collectionFilters, sourceType).then(result => {
      if (result.error === undefined) {
        return setRecordsToSearch(result);
      }

      return resetSearchResultSelect();
    });
  }

  if (hakuTyyppi === 'melinda') {
    return getPublicationByMelindaId(formJson['haku-arvo'], collectionFilters, sourceType).then(result => {
      if (result.error === undefined) {
        return setRecordsToSearch(result);
      }

      return resetSearchResultSelect();
    });
  }

  if (hakuTyyppi === 'isbn') {
    return getPublicationByISBN(formJson['haku-arvo'], collectionFilters, sourceType).then(result => {
      if (result.error === undefined) {
        return setRecordsToSearch(result);
      }

      return resetSearchResultSelect();
    });
  }

  if (hakuTyyppi === 'issn') {
    return getPublicationByISSN(formJson['haku-arvo'], collectionFilters, sourceType).then(result => {
      if (result.error === undefined) {
        return setRecordsToSearch(result);
      }

      return resetSearchResultSelect();
    });
  }

  throw new Error('Invalid search type!');
}

function setRecordsToSearch(records) {
  if (records.length === 0) {
    return resetSearchResultSelect();
  }

  const promises = records.map((record, index) => {
    return idbSet('artoSources', index, record.data);
  });

  Promise.all(promises).then(() => refreshSearchResultSelect());
}

function refreshSearchResultSelect() {
  const select = document.getElementById('julkaisu-haku-tulos-lista');
  select.innerHTML = '';

  idbGetStoredValues('artoSources').then(sources => {
    const data = sources.map(record => {
      const {title} = record;
      const publicationType = record.isElectronic ? 'e-aineisto' : 'painettu';
      const yearsStart = record.publisherInfo.publisherYears.start;
      const yearsEnd = record.publisherInfo.publisherYears.end ?? '';
      const hyphen = (record.recordType === ('Kausijulkaisu' || 'Päivittyvä julkaisu') ? '-' : '');

      const text = `${title} (${publicationType}: ${yearsStart}${hyphen}${yearsEnd})`;
      return {value: record.key, text};
    });

    setOptions(select, data);
  });
}
