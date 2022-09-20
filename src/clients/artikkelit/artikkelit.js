import {setNavBar, startProcess, stopProcess} from "/common/ui-utils.js";
import {Account, doLogin, logout} from "/common/auth.js"
import {showTab, resetForms, reload} from "/common/ui-utils.js";
import {articleTypesBooks, articleTypesJournal, authorRelators, languages, ontologyTypes, organizations, sciences, searchTypes, sourceTypes} from "./constants.js";
import {getArtikkeliRecord, getPublicationByISSN, getPublicationByISBN, getPublicationByTitle, getPublicationByMelinda} from "../common/rest.js";
import {showRecord} from "/common/marc-record-ui.js";
import {formToJson} from "/common/ui-utils.js";
import {idbGet, idbSet, idbClear, idbKeys} from "/artikkelit/indexDB.js"
import {addTempOrganization, getTempOrganizationList, removeTempOrganization, resetTempOrganizationList, createP, createIconButton, createHiddenInput, addAuthorToIdbIndex} from "./utils.js";
import {idbDel} from "./indexDB.js";



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

    document.getElementById("haku-julkaisu-title-form").addEventListener("submit", searchPublications);
    document.getElementById("haku-julkaisu-melinda-form").addEventListener("submit", searchPublications);
    document.getElementById("haku-julkaisu-isbn-form").addEventListener("submit", searchPublications);
    document.getElementById("haku-julkaisu-issn-form").addEventListener("submit", searchPublications);
    document.getElementById("tekija-lisaa-form").addEventListener("submit", addAuthor);
    resetSearchResultSelect();
    refreshAuthorsList();
  }
}

window.sourceTypeChange = (event) => {
  fillDatalistOptions();
}

window.showAndHideSearchInputs = (event) => {
  document.getElementById(`haku-julkaisu-title-form`).style.display = 'none';
  document.getElementById(`haku-julkaisu-issn-form`).style.display = 'none';
  document.getElementById(`haku-julkaisu-isbn-form`).style.display = 'none';
  document.getElementById(`haku-julkaisu-melinda-form`).style.display = 'none';

  // console.log(event.target.value);

  document.getElementById(`haku-julkaisu-${event.target.value}-form`).style.display = 'block';
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

      const formData = collectFormData();
      getArtikkeliRecord({...data, ...formData}).then(({record}) => showRecord(record, "record1", {}, 'artikkelit-lisaa'));
    });
  }
}

window.doUpdate = (event) => {
  event.preventDefault();
  const tietueIndex = document.getElementById('haku-tulos-lista').value;

  idbGet('artoSources', parseInt(tietueIndex)).then(data => {
    const formData = collectFormData();
    getArtikkeliRecord({...data, ...formData}).then(({record}) => showRecord(record, "record1", {}, 'artikkelit-lisaa'));
  });
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
    journalNumberPublishingYear: document.getElementById(`numeron-vuosi`).value,
    journalNumberVol: document.getElementById(`numeron-vol`).value,
    journalNumberNro: document.getElementById(`numeron-numero`).value,
    journalNumberPages: document.getElementById(`numeron-sivut`).value,
    articleTitle: document.getElementById(`artikkelin-otsikko`).value,
    articleLanguage: document.getElementById(`artikkelin-kieli`).value,
    articleLink: document.getElementById(`artikkelin-linkki`).value
  };
}

function resetSearchResultSelect() {
  const select = document.getElementById('haku-tulos-lista');
  select.innerHTML = '';
  setOptions(select, [{value: '', text: 'Ei tuloksia'}], true);
  document.getElementById(`lehden-nimi`).innerHTML = '';
  document.getElementById(`lehden-melindaId`).innerHTML = '';
  document.getElementById(`lehden-issn`).innerHTML = '';
  document.getElementById(`lehden-isbn`).innerHTML = '';
  document.getElementById(`lehden-julkaisu-tyyppi`).innerHTML = '';
  document.getElementById(`lehden-elektroninen-julkaisu`).innerHTML = '';
  document.getElementById(`lehden-vuodet-min`).innerHTML = '';
  document.getElementById(`lehden-vuodet-max`).innerHTML = '';
}

function searchPublications(event) {
  event.preventDefault();

  resetSearchResultSelect();
  const hakuTyyppi = document.getElementById(`haku-tyyppi`).value;
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

function setRecordsToSearch(records) {
  const select = document.getElementById('haku-tulos-lista');
  if (records.length === 0) {
    return resetSearchResultSelect();
  }
  const data = records.map((record, index) => {
    const title = record.data.title;
    idbSet('artoSources', index, record.data);
    return {value: index, text: title};
  });

  setOptions(select, data);
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

  addAuthorToIdbIndex(data).then(() => {
    refreshAuthorsList();
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

    if (select.name.indexOf('haku-tyyppi') === 0) {
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

function setOptions(element, jsonArray, disabled = false) {
  element.innerHTML = '';
  jsonArray.forEach((obj, index) => {
    const opt = document.createElement('option');
    opt.value = obj.value;
    opt.innerHTML = obj.text;
    opt.selected = disabled;
    opt.disabled = disabled;
    element.append(opt);
    if (element.nodeName === 'select' && index === 0) {
      element.selectedIndex = 0;
    }
  });

  element.dispatchEvent(new Event('change'));
}