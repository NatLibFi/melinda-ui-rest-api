import {
  articleTypesBooks, articleTypesJournal, authorRelators, ccLicenses,
  languages, ontologyTypes, organizations, sciences,
  searchFilters, searchTypes, sourceTypes, sectionOrColumnList
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

    if (select.name === 'julkaisu-haku-tyyppi') {
      setOptions(select, searchTypes);
    }

    if (select.name === 'julkaisu-haku-rajaus') {
      setOptions(select, searchFilters);
    }

    if (select.name === 'kuvailtava-kohde') {
      setOptions(select, sourceTypes);
    }

    if (select.name === 'artikkelin-cc-lisenssi') {
      setOptions(select, ccLicenses, false, 'Ei CC-lisenssiä');
    }

    if (select.name.endsWith('-kieli')) {
      setOptions(select, languages);
    }

    if (select.name.endsWith('-rooli')) {
      setOptions(select, authorRelators);
    }

    if (select.name.endsWith('-ontologia')) {
      setOptions(select, ontologyTypes);
    }

  }
}

export function fillDatalistOptions() {
  const datalists = document.getElementsByTagName('datalist');

  for (let index = 0; index < datalists.length; index += 1) {
    const datalist = datalists[index];

    if (datalist.id.endsWith('-tieteenala-lista')) {
      setOptions(datalist, sciences);
    }

    if (datalist.id.endsWith('-organisaatio-lista')) {
      setOptions(datalist, organizations);
    }

    if (datalist.id.endsWith('-osasto-toistuva-lista')) {
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
