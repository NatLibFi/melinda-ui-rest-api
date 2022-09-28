import {formToJson} from "/common/ui-utils.js";
import {idbAddValueToLastIndex, idbGetStoredValues, idbClear} from "/artikkelit/indexDB.js"
import {createIconButton, createP} from "/artikkelit/utils.js"

export function initArticle() {
  console.log('initializing article...')
  document.getElementById("lisa-tiedot-lisaa-tieteenala").addEventListener("submit", addScience);
  document.getElementById("lisa-tiedot-lisaa-metodologia").addEventListener("submit", addMetodology);

  document.getElementById("tyhjenna-tieteenalat-form").addEventListener("submit", clearSciences);
  document.getElementById("tyhjenna-metodologiat-form").addEventListener("submit", clearMetodologys);

  refreshSciencesList();
  refreshMetodologysList();
}

function addScience(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  console.log('science');
  const [department, departmentName, subCategory, subject] = formJson['lisa-tiedot-tieteenala'].split(" - ");

  idbAddValueToLastIndex('artoSciences', {department, departmentName, subCategory, subject}).then(() => {
    document.getElementById("lisa-tiedot-tieteenala").value = '';
    refreshSciencesList();
  });
}

function addMetodology(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  console.log('metodology');
  const metodology = formJson['lisa-tiedot-metodologia'];

  idbAddValueToLastIndex('artoMetodologys', {value: metodology}).then(() => {
    document.getElementById("lisa-tiedot-metodologia").value = '';
    refreshMetodologysList();
  });
}

export function refreshSciencesList() {
  console.log('refresh scienceList');
  const scienceList = document.getElementById("tieteenalat-list");
  scienceList.innerHTML = '';

  idbGetStoredValues('artoSciences').then(sciences => {
    sciences.forEach(scienceData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('close', ['no-border', 'negative'], `return removeScience(event, ${scienceData.key})`, 'Poista');
      div.appendChild(createP('Tieteenala', '', '&nbsp;-&nbsp;', ['label-text']));
      div.appendChild(createP(scienceData.departmentName));
      div.appendChild(createP(scienceData.subject, '&nbsp;-&nbsp;'));
      form.appendChild(div);
      div.appendChild(removeButton);
      scienceList.appendChild(form);
    });

    if (sciences.length > 1) {
      document.getElementById("tyhjenna-tieteenalat-form").style.display = 'block';
    }

    if (sciences.length < 2) {
      document.getElementById("tyhjenna-tieteenalat-form").style.display = 'none';
    }
  });
}

export function clearSciences(event) {
  event.preventDefault();
  idbClear('artoSciences').then(() => refreshSciencesList());
}


export function refreshMetodologysList() {
  console.log('refresh metodologyList');
  const metodologyList = document.getElementById("metodologiat-list");
  metodologyList.innerHTML = '';

  idbGetStoredValues('artoMetodologys').then(metodologys => {
    metodologys.forEach(metodologyData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('close', ['no-border', 'negative'], `return removeMetodology(event, ${metodologyData.key})`, 'Poista');
      div.appendChild(createP('Metodologia', '', '&nbsp;-&nbsp;', ['label-text']));
      div.appendChild(createP(metodologyData.value));
      div.appendChild(removeButton);
      form.appendChild(div);
      metodologyList.appendChild(form);
    });

    if (metodologys.length > 1) {
      document.getElementById("tyhjenna-metodologiat-form").style.display = 'block';
    }

    if (metodologys.length < 2) {
      document.getElementById("tyhjenna-metodologiat-form").style.display = 'none';
    }
  });
}

export function clearMetodologys(event) {
  event.preventDefault();
  idbClear('artoMetodologys').then(() => refreshMetodologysList());
}
