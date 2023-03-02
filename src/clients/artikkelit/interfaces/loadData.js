import {articleTypesBooks, articleTypesJournal, authorRelators, languages, ontologyTypes, organizations, sciences, searchTypes, sourceTypes, reviewTypesList, sectionOrColumnList} from "/artikkelit/interfaces/constants.js";
import {setOptions} from "/common/ui-utils.js"

export function fillFormOptions() {
  fillSelectOptions();
  fillDatalistOptions();
}

export async function fillSelectOptions() {
  const selects = document.getElementsByTagName('select');
  //console.log(selects);
  for (var index = 0; index < selects.length; index += 1) {
    const select = selects[index];

    if (select.name.indexOf('julkaisu-haku-tyyppi') === 0) {
      setOptions(select, searchTypes);
    }

    if (select.name.indexOf('kuvailtava-kohde') === 0) {
      setOptions(select, sourceTypes);
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
  //console.log(datalists);
  const sourceType = document.querySelector('#kuvailtava-kohde').value;
  //console.log(sourceType);
  for (var index = 0; index < datalists.length; index += 1) {
    const datalist = datalists[index];

    if (datalist.id.indexOf('-tyyppi-lista') !== -1) {
      if (sourceType === 'book') {
        setOptions(datalist, articleTypesBooks);
      }

      if (sourceType === 'journal') {
        setOptions(datalist, articleTypesJournal);
      }
    }

    if (datalist.id.indexOf('-tieteenala-lista') !== -1) {
      setOptions(datalist, sciences);
    }

    if (datalist.id.indexOf('-organisaatio-lista') !== -1) {
      setOptions(datalist, organizations);
    }

    if (datalist.id.indexOf('-luokitus-lista') !== -1) {
      setOptions(datalist, reviewTypesList);
    }

    if (datalist.id.indexOf('-osasto-toistuva-lista') !== -1) {
      setOptions(datalist, sectionOrColumnList);
    }
  }
}
