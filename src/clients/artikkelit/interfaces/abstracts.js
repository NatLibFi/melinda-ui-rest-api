import {idbAddValueToLastIndex, idbGetStoredValues} from "/artikkelit/indexDB.js"
import {formToJson} from "/common/ui-utils.js";
import {createIconButton, createP} from "/artikkelit/utils.js"

export function addAbstract(event) {
  event.preventDefault();
  const formJson = formToJson(event);

  const data = {
    language: formJson['tiivistelma-kieli'],
    abstract: formJson['tiivistelma-abstrakti']
  }

  idbAddValueToLastIndex('artoAbstracts', data).then(() => {
    refreshAbstractList();
  });
}

export function refreshAbstractList() {
  const abstractsList = document.getElementById('tiivistelmat-list');
  abstractsList.innerHTML = '';

  idbGetStoredValues('artoAbstracts').then(abstracts => {
    abstracts.forEach(abstractData => {
      const form = document.createElement('form');
      form.classList.add('full-width');
      const removeButton = createIconButton('close', ['no-border'], `return removeAbstract(event, ${abstractData.key})`, 'Poista')
      form.appendChild(removeButton);
      form.appendChild(createP(abstractData.language, '', '&nbsp;-&nbsp;'));
      form.appendChild(createP(abstractData.abstract));
      abstractsList.appendChild(form)
    });
  });
}