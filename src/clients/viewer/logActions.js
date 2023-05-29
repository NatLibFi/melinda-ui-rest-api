import {startProcess, stopProcess, showSnackbar, disableElement} from '/common/ui-utils.js';
import {protectLog, removeLog} from '/common/rest.js';
import {} from './viewer.js'

//-----------------------------------------------------------------------------------------
// Functions for log and record actions: copy link to record, protect record and remove log
//-----------------------------------------------------------------------------------------

window.copyLink = function (event) {
  eventHandled(event);

  const logType = document.querySelector(`#viewer #logType`).value || '';
  const id = document.querySelector(`#viewer #id`).value || '';
  const sequence = document.querySelector(`#viewer #sequence`).value || '';

  let link = window.location;

  if (id !== '' && sequence !== '') {
    link = `${window.location}?id=${id}&logType=${logType}&sequence=${sequence}`;
  }

  const button = createTestLinkButton(link);

  showSnackbar({text: `Linkki kopioitu!`, actionButton: button, closeButton: 'true'});
  navigator.clipboard.writeText(link);

  function createTestLinkButton(link) {
    const testLinkButton = document.createElement('button');
    testLinkButton.innerHTML = 'Testaa linkkiä';
    testLinkButton.title = link;
    testLinkButton.addEventListener('click', () => {
      window.open(link);
    });
    return testLinkButton;
  }
};

window.protect = function (event = undefined) {
  eventHandled(event);
  console.log('Protecting...');
  startProcess();

  const id = document.querySelector(`#viewer #id`).value || '';
  const sequence = document.querySelector(`#viewer #sequence`).value || 1;
  const protectButton = document.querySelector(`#viewer #protect`);

  if (id === '') {
    showSnackbar({text: 'ID:tä ei turvattu, koska ID-kenttä on tyhjä. Hae ID vielä uudelleen ennen turvaamista!', actionButton: 'true'});
    console.log('Nothing to protect...');
    stopProcess();
    return;
  }

  protectLog(id, sequence)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Response status ok:false');
      }
      protectButton.innerHTML === 'lock_open'
        ? (setProtectButton('protected'), showSnackbar({text: `Turvattu sekvenssi ${sequence} ID:lle <span class="correlation-id-font">${id}</span>`}))
        : (setProtectButton('not protected'), showSnackbar({text: `Turvaus poistettu ID:n <span class="correlation-id-font">${id}</span> sekvenssistä ${sequence}`, closeButton: 'true'}));
    })
    .catch(error => {
      showSnackbar({text: 'Valitettavasti tämän ID:n ja sekvenssin turvausta ei pystytty muuttamaan!', closeButton: 'true'});
      console.log(`Error while trying to protect log with correlation id ${id} and sequence ${sequence} `, error);
    })
    .finally(() => stopProcess());
};

export function setProtectButton(type) {
  const protectButton = document.querySelector(`#viewer #protect`);

  if (type === 'protected') {
    setProtectButtonProperties('lock', 'Poista turvaus tästä sekvenssistä', 'Poista turvaus');
    return;
  }

  if (type === 'not protected') {
    setProtectButtonProperties('lock_open', 'Turvaa tämä sekvenssi', 'Turvaa');
    return;
  }

  disableElement(protectButton);

  function setProtectButtonProperties(icon, infoText, tooltipText) {
    protectButton.innerHTML = icon;
    protectButton.title = infoText;
    protectButton.setAttribute('tooltip-text', tooltipText);
  }
}

window.openRemoveDialog = function (event = undefined) {
  eventHandled(event);
  const id = document.querySelector(`#viewer #id`).value || '';
  const dialog = document.getElementById('dialogForRemove');
  const dialogIdText = document.getElementById('idToBeRemoved');

  if (id === '') {
    showSnackbar({text: 'ID:tä ei poistettu, koska ID-kenttä on tyhjä. Hae ID vielä uudelleen ennen poistamista!', closeButton: 'true'});
    console.log('Nothing to remove...');
    stopProcess();
    return;
  }

  dialogIdText.innerHTML = ` ${id} `;
  dialog.showModal();
};

window.cancelRemove = function (event = undefined) {
  console.log('Nothing removed');
  showSnackbar({text: 'Toiminto peruttu!', closeButton: 'true'});
};

window.confirmRemove = function (event = undefined) {
  console.log('Removing...');
  startProcess();

  const id = document.querySelector(`#viewer #id`).value || '';

  remove(id);
};

function remove(id) {
  const force = '1';

  removeLog(id, force)
    .then(() => {
      clearLogView();
      showSnackbar({text: `Poistettiin ID <span class="correlation-id-font">${id}</span>`, closeButton: 'true'});
      console.log(`Log ${id} removed`);
    })
    .catch(error => {
      showSnackbar({text: 'Valitettavasti tätä ID:tä ei pystytty poistamaan!', closeButton: 'true'});
      console.log(`Error while trying to remove log with correlation id ${id}: `, error);
    })
    .finally(() => stopProcess());
}
