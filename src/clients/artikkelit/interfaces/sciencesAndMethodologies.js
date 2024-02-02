import {idbAddValueToLastIndex, idbClear, idbDel, idbGetStoredValues, } from '/artikkelit/utils/indexedDB.js';
import {createIconButton, createP, formToJson, showNotification} from '/common/ui-utils.js';


export function initSciencesAndMethodologies() {
  //console.log('initializing sciences and methodologies...');
  
  document.getElementById('lisa-tiedot-lisaa-tieteenala').addEventListener('submit', addScience);
  document.getElementById('lisa-tiedot-lisaa-metodologia').addEventListener('submit', addMetodology);

  document.getElementById('tyhjenna-tieteenalat-form').addEventListener('submit', clearSciences);
  document.getElementById('tyhjenna-metodologiat-form').addEventListener('submit', clearMetodologys);

  refreshSciencesList();
  refreshMetodologysList();
}

export function refreshMetodologysList() {
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

export function refreshSciencesList() {
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

window.removeMetodology = (event, key) => {
  event.preventDefault();
  idbDel('artoMetodologys', key).then(() => refreshMetodologysList());
};

window.removeScience = (event, key) => {
  event.preventDefault();
  idbDel('artoSciences', key).then(() => refreshSciencesList());
};

function addMetodology(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  console.log('metodology');
  const metodology = formJson['lisa-tiedot-metodologia'];

  if (metodology === '') {
    showNotification({componentStyle: 'banner', style: 'alert', text: 'Metodologia ei voi olla tyhjä'});
    return;
  }

  idbGetStoredValues('artoMetodologys').then(metodologies => {
    if (metodologies.some(met => met.value === metodology)) {
      showNotification({componentStyle: 'banner', style: 'alert', text: 'Artikkelille on jo lisätty tämä metodologia'});
      return;
    }

    idbAddValueToLastIndex('artoMetodologys', {value: metodology}).then(() => {
      document.getElementById('lisa-tiedot-metodologia').value = '';
      refreshMetodologysList();
    });
  });
}

function addScience(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  console.log('science');
  const science = formJson['lisa-tiedot-tieteenala'];

  if (science === '') {
    showNotification({componentStyle: 'banner', style: 'alert', text: 'Tieteenala ei voi olla tyhjä'});
    return;

  }
  const [department, departmentName, subCategory, subject] = science.split(' - ');

  idbGetStoredValues('artoSciences').then(sciences => {
    if (sciences.some(sci => sci.subject === subject || sci.subCategory === subCategory)) {
      showNotification({componentStyle: 'banner', style: 'alert', text: 'Artikkelille on jo lisätty tämä tieteenala'});
      return;
    }

    idbAddValueToLastIndex('artoSciences', {department, departmentName, subCategory, subject}).then(() => {
      document.getElementById('lisa-tiedot-tieteenala').value = '';
      refreshSciencesList();
    });
  });
}

function clearMetodologys(event) {
  event.preventDefault();
  idbClear('artoMetodologys').then(() => refreshMetodologysList());
}

function clearSciences(event) {
  event.preventDefault();
  idbClear('artoSciences').then(() => refreshSciencesList());
}
