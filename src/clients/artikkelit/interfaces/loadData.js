import {
  articleTypesBooks, articleTypesJournal, authorRelators,
  ccLicenses, languages, ontologyTypes, organizations,
  sciences, searchTypes, sourceTypes, sectionOrColumnList
} from '/artikkelit/interfaces/constants.js';

import {setOptions} from '/common/ui-utils.js';

export function fillFormOptions() {
  fillSelectOptions();
  fillDatalistOptions();
  fillArticleTypeOptions();
}

function fillSelectOptions() {
  const selects = document.getElementsByTagName('select');

  for (let index = 0; index < selects.length; index += 1) {
    const select = selects[index];

    if (select.name.indexOf('julkaisu-haku-tyyppi') === 0) {
      setOptions(select, searchTypes);
    }

    if (select.name.indexOf('kuvailtava-kohde') === 0) {
      setOptions(select, sourceTypes);
    }

    if (select.name === 'artikkelin-cc-lisenssi') {
      setOptions(select, ccLicenses, false, 'Ei CC-lisenssiä');
    }

    if (select.name.indexOf('-kieli') !== -1) {
      setOptions(select, languages);
    }

    if (select.name.indexOf('-rooli') !== -1) {
      setOptions(select, authorRelators);
    }

    if (select.name.indexOf('-ontologia') !== -1) {
      setOptions(select, ontologyTypes);
    }

  }
}

export function fillDatalistOptions() {
  const datalists = document.getElementsByTagName('datalist');

  for (let index = 0; index < datalists.length; index += 1) {
    const datalist = datalists[index];

    if (datalist.id.indexOf('-tieteenala-lista') !== -1) {
      setOptions(datalist, sciences);
    }

    if (datalist.id.indexOf('-organisaatio-lista') !== -1) {
      setOptions(datalist, organizations);
    }

    if (datalist.id.indexOf('-osasto-toistuva-lista') !== -1) {
      setOptions(datalist, sectionOrColumnList);
    }
  }
}

export function fillArticleTypeOptions() {
  const sourceType = document.querySelector('#kuvailtava-kohde').value;
  const articleType = document.querySelector('#artikkelin-tyyppi');

  if (sourceType === 'book') {
    setOptions(articleType, articleTypesBooks, false, 'Ei artikkelin tyyppiä');
  }

  if (sourceType === 'journal') {
    setOptions(articleType, articleTypesJournal, false, 'Ei artikkelin tyyppiä');
  }
}
