import {idbAddValueToLastIndex, idbGetStoredValues, idbClear} from '/artikkelit/indexDB.js';
import {formToJson, createIconButton, createP, showSnackbar} from '/common/ui-utils.js';

export function initArticle() {
  console.log('initializing article...');
  document.getElementById('lisa-tiedot-lisaa-tieteenala').addEventListener('submit', addScience);
  document.getElementById('lisa-tiedot-lisaa-metodologia').addEventListener('submit', addMetodology);

  document.getElementById('tyhjenna-tieteenalat-form').addEventListener('submit', clearSciences);
  document.getElementById('tyhjenna-metodologiat-form').addEventListener('submit', clearMetodologys);

  document.getElementById('lisaa-linkki').addEventListener('click', addArticleLink);

  refreshSciencesList();
  refreshMetodologysList();
  resetAndHideCcLicense();
}

function addScience(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  console.log('science');
  const science = formJson['lisa-tiedot-tieteenala'];

  if (science === '') {
    showSnackbar({style: 'alert', text: 'Tieteenala ei voi olla tyhjä'});
    return;

  }
  const [department, departmentName, subCategory, subject] = science.split(' - ');

  idbGetStoredValues('artoSciences').then(sciences => {
    if (sciences.some(sci => sci.subject === subject || sci.subCategory === subCategory)) {
      showSnackbar({style: 'alert', text: 'Artikkelille on jo lisätty tämä tieteenala'});
      return;
    }

    idbAddValueToLastIndex('artoSciences', {department, departmentName, subCategory, subject}).then(() => {
      document.getElementById('lisa-tiedot-tieteenala').value = '';
      refreshSciencesList();
    });
  });
}

function addMetodology(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  console.log('metodology');
  const metodology = formJson['lisa-tiedot-metodologia'];

  if (metodology === '') {
    showSnackbar({style: 'alert', text: 'Metodologia ei voi olla tyhjä'});
    return;
  }

  idbGetStoredValues('artoMetodologys').then(metodologies => {
    if (metodologies.some(met => met.value === metodology)) {
      showSnackbar({style: 'alert', text: 'Artikkelille on jo lisätty tämä metodologia'});
      return;
    }

    idbAddValueToLastIndex('artoMetodologys', {value: metodology}).then(() => {
      document.getElementById('lisa-tiedot-metodologia').value = '';
      refreshMetodologysList();
    });
  });
}

export function refreshSciencesList() {
  console.log('refresh scienceList');
  const scienceList = document.getElementById('tieteenalat-list');
  scienceList.innerHTML = '';

  idbGetStoredValues('artoSciences').then(sciences => {
    sciences.forEach(scienceData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('delete_outline', ['alternate-red', 'small'], `return removeScience(event, ${scienceData.key})`, 'Poista');
      div.appendChild(createP('Tieteenala', '', '&nbsp;-&nbsp;', ['label-text']));
      div.appendChild(createP(scienceData.departmentName));
      div.appendChild(createP(scienceData.subject, '&nbsp;-&nbsp;'));
      form.appendChild(div);
      div.appendChild(removeButton);
      scienceList.appendChild(form);
    });

    if (sciences.length > 1) {
      document.getElementById('tyhjenna-tieteenalat-form').style.display = 'block';
    }

    if (sciences.length < 2) {
      document.getElementById('tyhjenna-tieteenalat-form').style.display = 'none';
    }
  });

  doUpdate();
}

export function clearSciences(event) {
  event.preventDefault();
  idbClear('artoSciences').then(() => refreshSciencesList());
}

export function refreshMetodologysList() {
  console.log('refresh metodologyList');
  const metodologyList = document.getElementById('metodologiat-list');
  metodologyList.innerHTML = '';

  idbGetStoredValues('artoMetodologys').then(metodologys => {
    metodologys.forEach(metodologyData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('delete_outline', ['alternate-red', 'small'], `return removeMetodology(event, ${metodologyData.key})`, 'Poista');
      div.appendChild(createP('Metodologia', '', '&nbsp;-&nbsp;', ['label-text']));
      div.appendChild(createP(metodologyData.value));
      div.appendChild(removeButton);
      form.appendChild(div);
      metodologyList.appendChild(form);
    });

    if (metodologys.length > 1) {
      document.getElementById('tyhjenna-metodologiat-form').style.display = 'block';
    }

    if (metodologys.length < 2) {
      document.getElementById('tyhjenna-metodologiat-form').style.display = 'none';
    }
  });

  doUpdate();
}

export function addArticleLink(event) {
  event.preventDefault();
  const articleWrap = document.getElementById('artikkelin-linkki-wrap');
  const upperDiv = document.createElement('div');
  upperDiv.classList.add('full-width');
  const lowerDiv = document.createElement('div');
  lowerDiv.classList.add('Input');
  const removeButton = createIconButton('delete_outline', ['alternate-red', 'small'], `return removeArticleLink(event)`, 'Poista');
  lowerDiv.appendChild(createLabel('artikkelin-linkki'));
  lowerDiv.appendChild(createInput('artikkelin-linkki'));
  upperDiv.appendChild(lowerDiv);
  upperDiv.appendChild(removeButton);
  articleWrap.appendChild(upperDiv);

  function createLabel(id) {
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.innerHTML = 'Linkki kokotekstiin:';
    return label;
  }

  function createInput(name) {
    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('id', name);
    input.setAttribute('name', name);
    input.setAttribute('maxLength', 128);
    return input;
  }
}

export function clearMetodologys(event) {
  event.preventDefault();
  idbClear('artoMetodologys').then(() => refreshMetodologysList());
}

export function resetAndHideCcLicense() {
  const ccLicenseSelect = document.getElementById('artikkelin-cc-lisenssi');
  const ccLicenseFormField = document.getElementById('artikkelin-cc-lisenssi-wrap');

  ccLicenseSelect.selectedIndex = 0;
  hideCcLicense();

  function hideCcLicense() {
    ccLicenseFormField.style.display = 'none';
    ccLicenseSelect.disabled = true;
  }
}

export function showCcLicense() {
  const ccLicenseFormField = document.getElementById('artikkelin-cc-lisenssi-wrap');
  const ccLicenseSelect = document.getElementById('artikkelin-cc-lisenssi');

  ccLicenseFormField.style.display = 'block';
  ccLicenseSelect.removeAttribute('disabled');
}
