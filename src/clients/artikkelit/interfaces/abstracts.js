import {idbAddValueToLastIndex, idbGetStoredValues, idbClear} from "/artikkelit/indexDB.js"
import {formToJson, createIconButton, createP} from "/common/ui-utils.js";

export function initAbstracts() {
  console.log('initializing abstracts...');
  document.getElementById("tiivistelma-lisaa-form").addEventListener("submit", addAbstract);

  document.getElementById("tyhjenna-tiivistelmat-form").addEventListener("submit", clearAbstracts);

  refreshAbstractList();
}

export function addAbstract(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  const [iso6391, iso6392b, ui] = formJson['tiivistelma-kieli'].split(';');

  const data = {
    language: {iso6391, iso6392b, ui},
    abstract: formJson['tiivistelma-abstrakti']
  }

  idbAddValueToLastIndex('artoAbstracts', data).then(() => {
    document.getElementById("tiivistelma-lisaa-form").reset();
    refreshAbstractList();
  });
}

export function refreshAbstractList() {
  const abstractsList = document.getElementById('tiivistelmat-list');
  abstractsList.innerHTML = '';

  idbGetStoredValues('artoAbstracts').then(abstracts => {
    abstracts.forEach(abstractData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('close', ['no-border', 'negative'], `return removeAbstract(event, ${abstractData.key})`, 'Poista')
      div.appendChild(createP(abstractData.language.ui, '', '&nbsp;-&nbsp;', ['label-text']));
      const abstractP = createP(abstractData.abstract);
      abstractP.classList.add('long-text');
      abstractP.setAttribute("lang", abstractData.language.iso6391);
      div.appendChild(abstractP);
      div.appendChild(removeButton);
      form.appendChild(div);
      abstractsList.appendChild(form)
    });

    if (abstracts.length > 1) {
      document.getElementById("tyhjenna-tiivistelmat-form").style.display = 'block';
    }

    if (abstracts.length < 2) {
      document.getElementById("tyhjenna-tiivistelmat-form").style.display = 'none';
    }
  });
}

export function clearAbstracts(event) {
  event.preventDefault();
  idbClear('artoAbstracts').then(() => refreshAbstractList());
}