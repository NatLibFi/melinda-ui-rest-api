import {setNavBar, startProcess, stopProcess} from "/common/ui-utils.js";
import {Account, doLogin, logout} from "/common/auth.js"
import {showTab, resetForms, reload} from "/common/ui-utils.js";
import {articleTypesBooks, articleTypesJournal, authorRelators, languages, ontologyTypes, organizations, sciences, searchTypes, sourceTypes} from "./constants.js";
import {getArtikkeliRecord, getPublicationByISSN, getPublicationByISBN, getPublicationByTitle, getPublicationByMelinda, getOntologyWords} from "../common/rest.js";
import {showRecord} from "/common/marc-record-ui.js";
import {formToJson} from "/common/ui-utils.js";
import {idbGet, idbSet, idbClear, idbKeys, idbAddValueToLastIndex} from "/artikkelit/indexDB.js"
import {addTempOrganization, getTempOrganizationList, removeTempOrganization, resetTempOrganizationList, createP, createIconButton, createHiddenInput, setOptions} from "./utils.js";
import {idbDel} from "./indexDB.js";
import {addValueToSessionStoreList, getSessionStoreValue, resetSessionStoreList} from "./sessionStorageManager.js";



window.initialize = function () {
  console.log('Initializing');
  setNavBar(document.querySelector('#navbar'), "artikkelit")
  resetTempOrganizationList();

  doLogin(authSuccess);

  function authSuccess(user) {
    // const username = document.querySelector("#account-menu #username")
    // username.innerHTML = Account.get()["Name"];
    showTab('artikkelit-lisaa');
    fillFormOptions();

    document.getElementById("julkaisu-haku-title-form").addEventListener("submit", searchPublications);
    document.getElementById("julkaisu-haku-melinda-form").addEventListener("submit", searchPublications);
    document.getElementById("julkaisu-haku-isbn-form").addEventListener("submit", searchPublications);
    document.getElementById("julkaisu-haku-issn-form").addEventListener("submit", searchPublications);
    document.getElementById("tekija-lisaa-form").addEventListener("submit", addAuthor);
    document.getElementById("asiasana-haku-yso-form").addEventListener("submit", searchOntologyWords);
    document.getElementById("asiasana-lisaa-form").addEventListener("submit", addOntologyWord);

    resetSearchResultSelect();
    resetOntologySelect();
    refreshAuthorsList();
    refreshOntologyWordList();
  }
}

window.sourceTypeChange = (event) => {
  fillDatalistOptions();
}

window.showAndHideSearchInputs = (event) => {
  document.getElementById(`julkaisu-haku-title-form`).style.display = 'none';
  document.getElementById(`julkaisu-haku-issn-form`).style.display = 'none';
  document.getElementById(`julkaisu-haku-isbn-form`).style.display = 'none';
  document.getElementById(`julkaisu-haku-melinda-form`).style.display = 'none';

  // console.log(event.target.value);

  document.getElementById(`julkaisu-haku-${event.target.value}-form`).style.display = 'block';
}

window.ontologySearchResultChange = () => {

}

window.searchResultChange = (event) => {
  if (event.target.value !== '') {
    idbGet('artoSources', parseInt(event.target.value)).then(data => {
      //console.log(data);
      document.getElementById(`lehden-nimi`).innerHTML = data.title;
      document.getElementById(`lehden-melindaId`).innerHTML = data.sourceIds.filter(id => (/^\(FI-MELINDA\)\d{9}$/u).test(id));
      document.getElementById(`lehden-issn`).innerHTML = data.issns;
      document.getElementById(`lehden-isbn`).innerHTML = data.isbns;
      document.getElementById(`lehden-julkaisu-tyyppi`).innerHTML = data.recordType;
      document.getElementById(`lehden-elektroninen-julkaisu`).innerHTML = data.isElectronic ? "Kyllä" : "Ei";
      document.getElementById(`lehden-vuodet-min`).innerHTML = data.publisherInfo.publisherYears.start;
      document.getElementById(`lehden-vuodet-max`).innerHTML = data.publisherInfo.publisherYears.end;
      document.getElementById(`lehden-paikka`).innerHTML = data.publisherInfo.publisherLocation;
    });
  }
}

window.doUpdate = (event) => {
  event.preventDefault();
  const tietueIndex = document.getElementById('julkaisu-haku-tulos-lista').value;
  idbKeys('artoAuthors').then(keys => {
    const promises = [];
    promises.push(idbGet('artoSources', parseInt(tietueIndex)));
    const reversedKeys = keys.reverse();
    reversedKeys.forEach(key => promises.push(idbGet('artoAuthors', key)));
    Promise.all(promises).then(data => {
      const [source, ...authors] = data;
      console.log(data);
      const formData = collectFormData();
      getArtikkeliRecord({source, ...formData, authors}).then(({record}) => showRecord(record, "record1", {}, 'artikkelit-lisaa'));
    });
  })
}

window.addOrganizationForAuthor = (event) => {
  event.preventDefault();
  const organizationInput = document.getElementById('tekija-organisaatio');
  const organizationInputValue = organizationInput.value;
  const organizationList = document.getElementById('tekija-organisaatiot-list');
  const [organizationNameAndShortTerm = false, code = false, note = false] = organizationInputValue.split(' - ');
  const [organizationName, organizationShortTerm] = organizationNameAndShortTerm.split(' (').map(value => value.replace(')', ''));

  const addListEntry = addTempOrganization({organizationName, code, organizationShortTerm, note});
  if (addListEntry) {
    const form = document.createElement('form');
    form.classList.add('full-width');
    const removeButton = createIconButton('close', ['no-border'], `return removeOrganizationForAuthor(event, "${code}")`, 'Poista')
    form.appendChild(removeButton);
    form.appendChild(createP(organizationName));

    if (organizationShortTerm) {
      form.appendChild(createP(organizationShortTerm, '&nbsp;/&nbsp;'));
    }

    if (code) {
      form.appendChild(createP(code, '&nbsp;/&nbsp;'));
    }

    if (note) {
      form.appendChild(createP(note, '&nbsp;(', ')'));
    }

    organizationList.appendChild(form);
    organizationInput.value = '';
  }
}

window.removeOrganizationForAuthor = (event, code) => {
  event.preventDefault();
  removeTempOrganization(code);
  const form = event.target.parentElement;
  form.remove();
}

window.resetAuthor = (event) => {
  resetAuthor(event);
}

function collectFormData() {
  return {
    journalNumber: {
      publishingYear: document.getElementById(`numeron-vuosi`).value,
      volume: document.getElementById(`numeron-vol`).value,
      number: document.getElementById(`numeron-numero`).value,
      pages: document.getElementById(`numeron-sivut`).value
    },
    article: {
      title: document.getElementById(`artikkelin-otsikko`).value,
      language: document.getElementById(`artikkelin-kieli`).value,
      link: document.getElementById(`artikkelin-linkki`).value
    },
    abstract: {
      text: document.getElementById(`tiivistelma-abstrakti`).value,
      language: document.getElementById(`tiivistelma-kieli`).value
    }
  };
}

function resetSearchResultSelect(searching) {
  const select = document.getElementById('julkaisu-haku-tulos-lista');
  select.innerHTML = '';
  document.getElementById(`lehden-nimi`).innerHTML = '';
  document.getElementById(`lehden-melindaId`).innerHTML = '';
  document.getElementById(`lehden-issn`).innerHTML = '';
  document.getElementById(`lehden-isbn`).innerHTML = '';
  document.getElementById(`lehden-julkaisu-tyyppi`).innerHTML = '';
  document.getElementById(`lehden-elektroninen-julkaisu`).innerHTML = '';
  document.getElementById(`lehden-vuodet-min`).innerHTML = '';
  document.getElementById(`lehden-vuodet-max`).innerHTML = '';

  if (searching) {
    return setOptions(select, [{value: '', text: 'Etsitään...'}], true);
  }

  setOptions(select, [{value: '', text: 'Ei tuloksia'}], true);
}

function searchPublications(event) {
  event.preventDefault();

  resetSearchResultSelect(true);
  const hakuTyyppi = document.getElementById(`julkaisu-haku-tyyppi`).value;
  const sourceType = document.querySelector('#kuvailtava-kohde').value;
  const formJson = formToJson(event);

  if (hakuTyyppi === 'issn') {
    return getPublicationByISSN(formJson['haku-arvo'], sourceType).then(result => console.log(result));
  }
  if (hakuTyyppi === 'isbn') {
    return getPublicationByISBN(formJson['haku-arvo'], sourceType).then(result => console.log(result));
  }
  if (hakuTyyppi === 'title') {
    return getPublicationByTitle(formJson['haku-arvo'], sourceType).then(result => setRecordsToSearch(result));
  }
  if (hakuTyyppi === 'melinda') {
    return getPublicationByMelinda(formJson['haku-arvo'], sourceType).then(result => console.log(result));
  }

  throw new Error('Invalid search type!');
}

function searchOntologyWords(event) {
  event.preventDefault();
  resetOntologySelect(true);
  const formJson = formToJson(event);
  getOntologyWords(formJson['asiasana-ontologia'], formJson['haku-arvo']).then(data => setOntologyWords(data.results));
}

function setRecordsToSearch(records) {
  if (records.length === 0) {
    return resetSearchResultSelect();
  }

  const select = document.getElementById('julkaisu-haku-tulos-lista');
  const data = records.map((record, index) => {
    const title = record.data.title;
    idbSet('artoSources', index, record.data);
    return {value: index, text: title};
  });

  setOptions(select, data);
}

function setOntologyWords(words) {
  if (words.length === 0) {
    return resetOntologySelect();
  }

  const select = document.getElementById('asiasana-haku-tulos-lista');
  const data = words.map((word, index) => {
    const title = `${word.prefLabel}${word.altLabel ? ` (${word.altLabel})` : ''}`;
    addValueToSessionStoreList('ontologyTempList', {identifier: index, ...word});
    return {value: index, text: title};
  });

  setOptions(select, data);
}

function resetOntologySelect(searching) {
  const select = document.getElementById('asiasana-haku-tulos-lista');
  select.innerHTML = '';

  if (searching) {
    resetSessionStoreList('ontologyTempList');
    return setOptions(select, [{value: '', text: 'Etsitään...'}], true);
  }

  setOptions(select, [{value: '', text: 'Ei tuloksia'}], true);
}

function resetAuthor(event) {
  event.preventDefault();
  resetTempOrganizationList();
  const organizationList = document.getElementById('tekija-organisaatiot-list');
  organizationList.innerHTML = '';
  document.getElementById('tekija-etunimi').value = '';
  document.getElementById('tekija-sukunimi').value = '';
  document.getElementById('tekija-rooli').value = 'kirjoittaja';
  document.getElementById('tekija-organisaatio').value = '';
}

window.removeAuthor = (event, key) => {
  event.preventDefault();
  idbDel('artoAuthors', key).then(() => refreshAuthorsList());
}

window.removeOntologyWord = (event, key) => {
  event.preventDefault();
  idbDel('artoOntologyWords', key).then(() => refreshOntologyWordList());
}

function addAuthor(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  const authorsTempOrganizations = getTempOrganizationList();

  const data = {
    firstName: formJson['tekija-etunimi'],
    lastName: formJson['tekija-sukunimi'],
    relator: formJson['tekija-rooli'],
    authorsTempOrganizations
  }

  idbAddValueToLastIndex('artoAuthors', data).then(() => {
    refreshAuthorsList();
  });
}

function addOntologyWord(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  const ontologyWord = getSessionStoreValue('ontologyTempList', formJson['asiasana-haku-tulos-lista']);
  console.log(ontologyWord);

  if (ontologyWord) {
    // idbIndex save
    idbAddValueToLastIndex('artoOntologyWords', ontologyWord).then(() => {
      // refresh ontology word list
      refreshOntologyWordList();
    })
  }
}

function refreshOntologyWordList() {
  const ontologyWordList = document.getElementById('asiasana-list');
  ontologyWordList.innerHTML = '';

  idbKeys('artoOntologyWords').then(keys => {
    keys.forEach(key => {
      idbGet('artoOntologyWords', key).then(word => {
        const form = document.createElement('form');
        form.classList.add('full-width');
        const removeButton = createIconButton('close', ['no-border'], `return removeOntologyWord(event, ${key})`, 'Poista')
        form.appendChild(removeButton);
        const pRelator = createP(word.prefLabel);
        pRelator.classList.add('capitalize');
        form.appendChild(pRelator);
        form.appendChild(createP(word.vocab, '&nbsp;-&nbsp;'));
        form.appendChild(createP(word.lang, '&nbsp;/&nbsp;'));
        form.appendChild(createP(word.uri, '&nbsp;-&nbsp;'));
        ontologyWordList.appendChild(form)
      });
    });
  });
}

function refreshAuthorsList() {
  const authorList = document.getElementById('tekija-list');
  authorList.innerHTML = '';

  idbKeys('artoAuthors').then(keys => {
    keys.forEach(key => {
      idbGet('artoAuthors', key).then(author => {
        const form = document.createElement('form');
        form.classList.add('full-width');
        const removeButton = createIconButton('close', ['no-border'], `return removeAuthor(event, ${key})`, 'Poista')
        form.appendChild(removeButton);
        const pRelator = createP(author.relator);
        pRelator.classList.add('capitalize');
        form.appendChild(pRelator);
        form.appendChild(createP(author.lastName, '&nbsp;-&nbsp;'));
        form.appendChild(createP(author.firstName, ',&nbsp;'));
        author.authorsTempOrganizations.forEach(organization => {
          form.appendChild(createP(organization.organizationName, '&nbsp;-&nbsp;'));
          if (organization.code) {
            form.appendChild(createP(organization.code, '&nbsp;/&nbsp;'));
          }

          if (organization.organizationShortTerm && !organization.code) {
            form.appendChild(createP(organization.organizationShortTerm, '&nbsp;/&nbsp;'));
          }

          if (organization.note) {
            form.appendChild(createP(organization.note, '&nbsp;(', ')'));
          }
        });
        authorList.appendChild(form)
      });
    });
  });
}

function fillFormOptions() {
  fillSelectOptions();
  fillDatalistOptions();
}

async function fillSelectOptions() {
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

function fillDatalistOptions() {
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
  }
}
