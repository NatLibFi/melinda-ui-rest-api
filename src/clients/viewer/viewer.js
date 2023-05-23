//*****************************************************************************
//
// New "Reactless" Viewer Sketch
//
//*****************************************************************************

import {showTab, setNavBar, startProcess, stopProcess, showSnackbar} from '/common/ui-utils.js';
import {Account, doLogin, logout} from '/common/auth.js';
import {showRecord} from '/common/marc-record-ui.js';
import {getMatchLog, getMergeLog, getCorrelationIdList, protectLog, removeLog} from '/common/rest.js';
import {idbSetLogs, idbGetLogs, idbClearLogs, idbSetList, idbGetList, idbClearList, doIndexedDbCheck} from '/viewer/indexDB.js';

var viewing = {
  record1: {},
  record2: {},
  record3: {}
}

//-----------------------------------------------------------------------------
// on page load:
//-----------------------------------------------------------------------------

window.initialize = function () {
  console.log('Initializing');
  setNavBar(document.querySelector('#navbar'), 'Viewer');

  const select = document.querySelector(`#viewer #sequence`);
  select.innerHTML = '';
  disableElement(select);

  doLogin(authSuccess);

  function authSuccess(user) {
    const username = document.querySelector(`#account-menu #username`);
    username.innerHTML = Account.get()['Name'];
    showTab('viewer');
    parseUrlParameters();
    doIndexedDbCheck();
    addModalEventListeners();
    addDialogEventListeners();
  }

  function parseUrlParameters() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id') || '';
    const logType = urlParams.get('logType') || 'MERGE_LOG';
    const sequence = urlParams.get('sequence') || '';

    if (id !== '') {
      document.querySelector(`#viewer #id`).defaultValue = id;
    }

    document.querySelector(`#viewer #sequenceInput`).value = sequence;
    document.querySelector(`#viewer #logType`).value = logType;

    window.history.pushState('', 'viewer', `/viewer/`);

    if (id !== '') {
      doSearchPress();
      showSnackbar({text: 'Haetaan linkin tietuetta...', closeButton: 'true'});
    }
  }

  // event listeners for some elements for the correlation id list modal 
  function addModalEventListeners() {
    const modal = document.querySelector(`#correlationIdListModal`);
    const dateStartInput = document.querySelector(`#correlationIdListModal #dateStartInput`);
    const dateEndInput = document.querySelector(`#correlationIdListModal #dateEndInput`);
    const scrollToTopButton = document.querySelector(`#correlationIdListModal #scrollToTopButton`);

    dateStartInput.addEventListener('click', event => {
      event.stopPropagation();
      unselectDateButtons();
    }, false);

    dateEndInput.addEventListener('click', event => {
      event.stopPropagation();
      unselectDateButtons();
    }, false);

    modal.addEventListener('scroll', event => {
      eventHandled(event);
      scrollToTopButton.style.display = (modal.scrollTop > 100 ? 'block' : 'none');
    });
  }

  // event listeners for some elements in the dialog for file upload 
  function addDialogEventListeners() {
    const fileInput = document.getElementById('fileUpload');
    const fileNameDiv = document.getElementById('selectedFileName');
    const clearFileSelectButton = document.getElementById('clearFileSelect');

    fileInput.addEventListener('change', event => {
      eventHandled(event);

      const file = fileInput.files[0];
      checkFile(file);

      file
        ? (fileNameDiv.innerHTML = file.name, fileNameDiv.classList.add('file-selected'), clearFileSelectButton.style.display = 'block')
        : (fileNameDiv.innerHTML = 'Ei valittua tiedostoa', fileNameDiv.classList.remove('file-selected'), clearFileSelectButton.style.display = 'none')

    });

  }

}

//-----------------------------------------------------------------------------

window.onAccount = function (e) {
  console.log('Account:', e);
  logout();
}


var transformed = {
  record1: {},
  record2: {},
  record3: {}
}

const oneDayInMs = (1 * 24 * 60 * 60 * 1000);


//-----------------------------------------------------------------------------
// Do button actions
//-----------------------------------------------------------------------------

window.doSearchPress = function (event = undefined) {
  const id = document.querySelector(`#viewer #id`).value || '';
  const logType = document.querySelector(`#viewer #logType`).value;
  const sequenceInputField = document.querySelector(`#viewer #sequenceInput`);
  const sequenceSelect = document.querySelector(`#viewer #sequence`);
  const sequence = sequenceInputField.value || sequenceSelect.value || 0;

  doFetch(event, id, sequence, logType);
}

window.doFetch = function (event = undefined, id = '', sequence = 0, logType = 'MERGE_LOG') {
  eventHandled(event);
  startProcess();
  idbClearLogs();

  const sequenceSelect = document.querySelector('#viewer #sequence');
  sequenceSelect.innerHTML = '';
  disableElement(sequenceSelect);
  const downloadFileButton = document.getElementById('export');
  disableElement(downloadFileButton);
  const col3 = document.querySelector('#viewer #record3').parentElement;
  const idInputField = document.querySelector(`#viewer #id`);
  console.log('Fetching...');

  if (id === '') {
    showSnackbar({text: 'Lisää ID haun aloittamista varten', closeButton: 'true'});
    highlightElement(idInputField);
    console.log('Nothing to fetch...');
    return stopProcess();
  }

  updateInfoTextWithSearchedId();

  if (logType === 'MERGE_LOG') {
    col3.style.display = 'block';
    enableElement(downloadFileButton);

    getMergeLog(id)
      .then(logs =>
        setDataToIndexDB(logs, sequence))
      .catch(error => {
        showLogError();
        console.log('Error fetching merge log: ', error);
        return stopProcess();
      })
  }

  if (logType === 'MATCH_LOG') {
    col3.style.display = 'none';
    getMatchLog(id)
      .then(logs =>
        setDataToIndexDB(logs, sequence))
      .catch(error => {
        showLogError();
        console.log('Error fetching match log: ', error);
        return stopProcess();
      })
  }

  function updateInfoTextWithSearchedId() {
    const infoTextDiv = document.getElementById(`lastSearchedInfoText`);
    infoTextDiv.innerHTML = (`Edellinen haku: <span class="correlation-id-font">${id}</span`);
    infoTextDiv.title = '';
  }

  function showLogError() {
    const clearButton = document.querySelector(`#viewer #clearLogs`);
    const protectButton = document.querySelector(`#viewer #protect`);
    const removeButton = document.querySelector(`#viewer #delete`);

    const button = createClearViewButton();
    showSnackbar({text: `ID:tä '${id}' lokityypillä '${logType}' ei valitettavasti pystytty hakemaan!`, actionButton: button, closeButton: 'true'});
    highlightElement(idInputField);
    enableElement(clearButton);
    disableElement(protectButton);
    disableElement(removeButton);

    function createClearViewButton() {
      const button = document.createElement('button');
      button.innerHTML = 'Tyhjää haku';

      button.addEventListener('click', () => {
        clearLogView();
      });

      return button;
    }
  }

}

window.loadLog = (event) => {
  eventHandled(event);

  const logType = document.querySelector(`#viewer #logType`).value;
  const sequenceInputField = document.querySelector(`#viewer #sequenceInput`);
  const sequenceSelect = document.querySelector(`#viewer #sequence`);

  const previousButton = document.querySelector(`#viewer #previousSequence`);
  const nextButton = document.querySelector(`#viewer #nextSequence`);
  const clearButton = document.querySelector(`#viewer #clearLogs`);
  const protectButton = document.querySelector(`#viewer #protect`);
  const removeButton = document.querySelector(`#viewer #delete`);

  const matchSelectWrap = document.querySelector('.col .header .Select');
  matchSelectWrap.style.visibility = 'hidden';

  const matchSelect = document.querySelector('.col .header #match');
  matchSelect.innerHTML = '';

  if (logType === 'EMPTY_LOG') {
    console.log('Clearing record view');

    const idInputField = document.querySelector(`#viewer #id`);
    const logTypeSelect = document.querySelector(`#viewer #logType`);
    const col3 = document.querySelector('#viewer #record3').parentElement;
    const settingsButton = document.getElementById('settings');
    const downloadButton = document.getElementById('export');


    idInputField.value = '';
    logTypeSelect.value = 'MERGE_LOG';
    sequenceInputField.value = '';
    sequenceSelect.replaceChildren();
    sequenceSelect.value = '';

    col3.style.display = 'block';
    sequenceInputField.style.display = 'block';
    sequenceSelect.style.display = 'none';

    disableElement(previousButton);
    disableElement(nextButton);
    disableElement(clearButton)
    disableElement(protectButton);
    disableElement(removeButton);
    disableElement(settingsButton);
    disableElement(downloadButton);

    setRecordTopInfo('record1', `Sisääntuleva tietue`);
    showRecord({}, 'record1', {}, 'viewer');
    setRecordTopInfo('record2', `Melinda-tietue`);
    showRecord({}, 'record2', {}, 'viewer');
    setRecordTopInfo('record3', 'Yhdistetty tietue');
    showRecord({}, 'record3', {}, 'viewer');
    return;
  }

  enableElement(clearButton);
  checkLogProtection();
  updateSequenceView();

  if (logType === 'MERGE_LOG') {
    idbGetLogs(event.target.value).then(data => {
      setRecordTopInfo('record1', `Sisääntuleva tietue${data.preference.recordName === 'incomingRecord' ? ' (Suositaan)' : ''}`, false);
      showRecord(data.incomingRecord, 'record1', {}, 'viewer');
      setRecordTopInfo('record2', `Melinda-tietue${data.preference.recordName === 'databaseRecord' ? ' (Suositaan)' : ''}`, false);
      showRecord(data.databaseRecord, 'record2', {}, 'viewer');
      setRecordTopInfo('record3', 'Yhdistetty tietue', `<li>Luontiaika: ${data.creationTime}</li>`);
      showRecord(data.mergedRecord, 'record3', {}, 'viewer');
    });
  }

  if (logType === 'MATCH_LOG') {
    idbGetLogs(event.target.value).then(data => {
      data.matchResult.forEach((result, index) => {
        matchSelect.add(createOption(result.matchSequence, index));
      });

      if (data.matchResult && data.matchResult.length === 0) {
        matchSelect.add(createOption('notFound', 0));
      }

      matchSelect.value = 0;
      matchSelect.dispatchEvent(new Event('change'));
    });
  }

  window.loadMatch = (event) => {
    eventHandled(event);
    const sequenceSelect = document.querySelector(`#viewer #sequence`).value;
    const matchSelectWrap = document.querySelector(`.col .header .Select`);
    showRecord({}, 'record3', {}, 'viewer');

    idbGetLogs(sequenceSelect).then(data => {
      matchSelectWrap.style.visibility = data.matchResult.length > 1 ? 'visible' : 'hidden';
      setRecordTopInfo('record1', 'Sisääntuleva tietue', false);
      showRecord(data.incomingRecord, "record1", {}, 'viewer');
      if (data.matchResult.length === 0) {
        setRecordTopInfo('record2', 'Vastaava Melinda tietue', '<li>Ei löytynyt</li>');
        showRecord({}, "record2", {}, 'viewer');
        return;
      }
      const {record, note} = getMergeCandidateInfo(data.matchResult[event.target.value]);
      setRecordTopInfo('record2', 'Vastaava Melinda-tietue', note);
      showRecord(record, 'record2', {}, 'viewer');
    });
  }

  function getMergeCandidateInfo(data) {
    const record = data?.candidate?.record;
    const id = data?.candidate?.id;
    const probability = data?.probability;
    const action = data?.action !== false ? data.action : 'Ei yhdistetä';
    const preferenceRecord = data?.preference?.value;
    const preference = data?.preference !== false ? data.preference.name : data?.message;
    return {
      record,
      note: `<li>Melinda-ID: ${id}</li><li>Käypäisyys: ${probability * 100}%</li><li>Yhdistämistapa: ${action}</li><li>Yhdistäessä pohjana: ${preferenceRecord === undefined ? 'Ei yhdistetä' : preferenceRecord === 'A' ? 'Sisääntuleva' : 'Melinda-tietue'}</li><li>Peruste: ${preference}</li>`
    }
  }

  function checkLogProtection() {
    disableElement(removeButton);

    idbGetLogs(event.target.value)
      .then(log =>
        log.protected === true ? (setProtectButton('protected'), toggleRemoveButtonByLogAge(log.creationTime)) : setProtectButton('not protected'),
        enableElement(protectButton))
      .catch(error =>
        console.log(`Sorry, the protection status for log with sequence ${event.target.value} could not be checked: `, error));

    function toggleRemoveButtonByLogAge(logCreationTime) {
      const isOverWeekOld = Date.parse(logCreationTime) < (Date.now() - (7 * oneDayInMs))
      isOverWeekOld ? enableElement(removeButton) : disableElement(removeButton)
    }

  }

  function updateSequenceView() {
    sequenceInputField.style.display = 'none';
    sequenceSelect.style.display = 'block';

    disableElement(nextButton)
    disableElement(previousButton);

    if (sequenceSelect.selectedIndex !== 0) {
      enableElement(previousButton);
    }

    if (sequenceSelect.selectedIndex < sequenceSelect.length - 1) {
      enableElement(nextButton);
    }
  }
}

window.showNote = (event, record) => {
  eventHandled(event);
  document.querySelector(`#viewer #${record} #showNote`).style.display = 'none';
  document.querySelector(`#viewer #${record} #hideNote`).style.display = 'block';
  document.querySelector(`#viewer #${record} .note`).style.display = 'block';
}

window.hideNote = (event, record) => {
  eventHandled(event);
  document.querySelector(`#viewer #${record} #showNote`).style.display = 'block';
  document.querySelector(`#viewer #${record} #hideNote`).style.display = 'none';
  document.querySelector(`#viewer #${record} .note`).style.display = 'none';
}

window.selectPrevious = function (event) {
  eventHandled(event)
  const select = document.querySelector(`#viewer #sequence`);
  setNewSelect(select.selectedIndex - 1);
}

window.selectNext = function (event) {
  eventHandled(event)
  const select = document.querySelector(`#viewer #sequence`);
  setNewSelect(select.selectedIndex + 1);
}

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
}

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
        throw new Error('Response status ok:false')
      }
      protectButton.innerHTML === 'lock_open'
        ? (setProtectButton('protected'), showSnackbar({text: `Turvattu sekvenssi ${sequence} ID:lle <span class="correlation-id-font">${id}</span>`}))
        : (setProtectButton('not protected'), showSnackbar({text: `Turvaus poistettu ID:n <span class="correlation-id-font">${id}</span> sekvenssistä ${sequence}`, closeButton: 'true'}))
    })
    .catch(error => {
      showSnackbar({text: 'Valitettavasti tämän ID:n ja sekvenssin turvausta ei pystytty muuttamaan!', closeButton: 'true'});
      console.log(`Error while trying to protect log with correlation id ${id} and sequence ${sequence} `, error);
    })
    .finally(() =>
      stopProcess());
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
}

window.cancelRemove = function (event = undefined) {
  console.log('Nothing removed');
  showSnackbar({text: 'Toiminto peruttu!', closeButton: 'true'});
}

window.confirmRemove = function (event = undefined) {
  console.log('Removing...');
  startProcess();

  const id = document.querySelector(`#viewer #id`).value || '';

  remove(id);
}

window.clearLogView = function (event = undefined) {
  eventHandled(event);
  const logType = document.querySelector(`#viewer #logType`);
  const sequenceSelect = document.querySelector(`#viewer #sequence`);

  logType.value = 'EMPTY_LOG';

  idbClearLogs();
  idbClearList();

  return sequenceSelect.dispatchEvent(new Event('change'));;
}

function setDataToIndexDB(logs, sequence) {
  const select = document.querySelector(`#viewer #sequence`);
  console.log(JSON.stringify(logs));
  const keys = Object.keys(logs);

  if (keys.length === 0) {
    const protectButton = document.querySelector(`#viewer #protect`);
    select.add(createOption('0', 0));
    idbSetLogs('0', {incomingRecord: {}, databaseRecord: {}, mergedRecord: {}});
    select.value = 0;
    disableElement(protectButton);
    showSnackbar({text: 'Valitettavasti tälle ID:lle ei löytynyt vastaavaa tietuetta', closeButton: 'true'});
    stopProcess();
    return select.dispatchEvent(new Event('change'));;
  }

  const refactorLogs = Object.fromEntries(keys.map(key => [logs[key].blobSequence, logs[key]]));
  const refactoredKeys = Object.keys(refactorLogs);

  enableElement(select);
  refactoredKeys.forEach(key => {
    idbSetLogs(key, refactorLogs[key]);
    select.add(createOption(key, key));
  });

  if (sequence !== 0 && refactoredKeys.includes(sequence)) {
    select.value = sequence;
  }

  const sequenceInputField = document.getElementById('sequenceInput');

  if (sequenceInputField.value !== '' && !refactoredKeys.includes(sequenceInputField.value)) {
    showSnackbar({text: `Ei hakutuloksia sekvenssille '${sequenceInputField.value}', näytetään sekvenssi ${select.value}`, closeButton: 'true'});
    highlightElement(select);
  }

  sequenceInputField.value = '';

  select.dispatchEvent(new Event('change'));

  stopProcess();
}

function setRecordTopInfo(record, title, additional = false) {
  document.querySelector(`#viewer #${record} .title`).innerHTML = `${title}`;

  if (additional === false) {
    document.querySelector(`#viewer #${record} .note`).style.display = 'none';
    document.querySelector(`#viewer #${record} #showNote`).style.display = 'none';
    document.querySelector(`#viewer #${record} #hideNote`).style.display = 'none';
  }

  if (additional !== false) {
    document.querySelector(`#viewer #${record} .note`).style.display = 'block';
    document.querySelector(`#viewer #${record} .additional`).innerHTML = `${additional}`;
    document.querySelector(`#viewer #${record} #showNote`).style.display = 'none';
    document.querySelector(`#viewer #${record} #hideNote`).style.display = 'block';
  }
}

function setProtectButton(type) {
  const protectButton = document.querySelector(`#viewer #protect`);

  switch (true) {
    case (type === 'protected'):
      setProtectButtonProperties('lock', 'Poista turvaus tästä sekvenssistä', 'Poista turvaus');
      break;
    case (type === 'not protected'):
      setProtectButtonProperties('lock_open', 'Turvaa tämä sekvenssi', 'Turvaa');
      break;
    default:
      disableElement(protectButton);
  }

  function setProtectButtonProperties(icon, infoText, tooltipText) {
    protectButton.innerHTML = icon;
    protectButton.title = infoText;
    protectButton.setAttribute('tooltip-text', tooltipText);
  }
}

function remove(id) {
  const force = '1';

  removeLog(id, force)
    .then(() => {
      clearLogView();
      showSnackbar({text: `Poistettiin ID <span class="correlation-id-font">${id}</span>`, closeButton: 'true'});
      console.log(`Log ${id} removed`)
    })
    .catch(error => {
      showSnackbar({text: 'Valitettavasti tätä ID:tä ei pystytty poistamaan!', closeButton: 'true'});
      console.log(`Error while trying to remove log with correlation id ${id}: `, error)
    })
    .finally(() =>
      stopProcess());
}

function setNewSelect(newIndex) {
  const select = document.querySelector(`#viewer #sequence`);

  select.selectedIndex = newIndex;

  const newEvent = new Event('change');
  newEvent.data = select
  select.dispatchEvent(newEvent);
}


//-----------------------------------------------------------------------------
// HTML element helper functions for Viewer
//-----------------------------------------------------------------------------

// creates a new html element option and returns it
// text and value attributes of element are given as parameters
function createOption(text, value) {
  const option = document.createElement('option');
  option.text = text;
  option.value = value;

  return option;
}

// enables the html element given as parameter
function enableElement(element) {
  element.removeAttribute('disabled');
}

// disables the html element given as parameter
function disableElement(element) {
  element.disabled = true;
}

// highligts a html element with a background color for a moment
// if no color is given as parameter, uses default color defined in the CSS
function highlightElement(element, color) {
  element.classList.add('highlight');

  if (color) {
    element.style.setProperty(`--highlightcolor`, color);
  }

  setTimeout(() => {
    element.classList.remove('highlight');
  }, 5000);
}

// returns an array of all html element descendants of the parent element
function getAllDescendants(parentElement) {
  const allDescendantElements = parentElement.getElementsByTagName('*');
  return [...allDescendantElements];
}


//-----------------------------------------------------------------------------
// Functions for file dialog
//-----------------------------------------------------------------------------

window.downloadFile = function (event) {
  console.log('Downloading file...');
  eventHandled(event);

  const correlationId = document.querySelector(`#viewer #id`).value;
  const sequence = document.querySelector(`#viewer #sequence`).value;
  const recordObject = new Object();

  idbGetLogs(sequence)
    .then((data) => {

      if (data.logItemType !== 'MERGE_LOG') {
        throw new Error('Wrong log item type (should be MERGE_LOG)');
      }

      setPreferred(data.preference);
      setIncomingRecord(data.incomingRecord);
      setMelindaRecord(data.databaseRecord);
      setMergedRecord(data.mergedRecord);
      setCreationTime(data.creationTime);
      doDownload(JSON.stringify(recordObject));
      showSnackbar({text: 'Tiedosto ladattiin onnistuneesti laitteellesi!', closeButton: 'true'});
    })
    .catch((error) => {
      console.log('Problem getting or setting log data while creating record object: ', error);
      showSnackbar({text: 'Tiedostoa ei valitettavasti pystytty lataamaan', closeButton: 'true'});
    })

  function setPreferred(preference) {
    if (preference.recordName === 'databaseRecord') {
      recordObject.preferred = 'melindaRecord';
      return;
    }

    recordObject.preferred = preference.recordName;
  }

  function setIncomingRecord(record) {
    recordObject.incomingRecord = record;
  }

  function setMelindaRecord(record) {
    recordObject.melindaRecord = record;
  }

  function setMergedRecord(record) {
    recordObject.mergedRecord = record;
  }

  function setCreationTime(time) {
    recordObject.creationTime = time;
  }

  function doDownload(fileContent) {
    const fileName = correlationId + '_' + sequence + '.json';

    const linkElement = document.createElement('a');
    linkElement.download = fileName;
    linkElement.href = 'data:attachment/text,' + encodeURI(fileContent);
    linkElement.click();
  }
}

window.uploadFile = function (event) {
  const dialog = document.getElementById('dialogForUpload');
  dialog.showModal();
}

window.showInstructions = function (event) {
  eventHandled(event);
  const instructions = document.getElementById('instructions');
  const hideButton = document.getElementById('hideInstructionsButton');
  const showButton = document.getElementById('showInstructionsButton');

  instructions.style.display = 'block';
  showButton.style.display = 'none';
  hideButton.style.display = 'flex';
}

window.hideInstructions = function (event) {
  eventHandled(event);
  const instructions = document.getElementById('instructions');
  const hideButton = document.getElementById('hideInstructionsButton');
  const showButton = document.getElementById('showInstructionsButton');

  instructions.style.display = 'none';
  showButton.style.display = 'flex';
  hideButton.style.display = 'none';
}

window.openFileBrowse = function (event) {
  eventHandled(event);
  const fileInput = document.getElementById('fileUpload');
  fileInput.click();
}

window.clearSelectedFile = function (event) {
  eventHandled(event);
  const fileInput = document.getElementById('fileUpload');
  fileInput.value = '';
  return fileInput.dispatchEvent(new Event('change'));
}

window.cancelUpload = function (event) {
  console.log('File upload cancelled');
  showSnackbar({text: 'Tiedoston avaaminen peruttu', closeButton: 'true'});
}

window.confirmUpload = function (event) {
  const file = document.getElementById('fileUpload').files[0];
  const reader = new FileReader();

  clearLogView();

  if (file) {
    console.log(`Trying to read file ${file.name}...`);
    reader.readAsText(file, 'UTF-8');

    reader.onload = function (event) {
      const fileContent = event.target.result;
      const json = parseJson(fileContent);
      const log = parseLog(json);

      if (log) {
        console.log('Log parsed from file: ', log);
        setDataToIndexDB({0: log}, 0);
        showReaderMode();
        showSnackbar({text: 'Jos tietueissa on puutteita, tarkista aina myös lataamasi tiedoston laatu.', closeButton: 'true'});
      }
    }

    reader.onerror = function (event) {
      console.log('Error reading file ', error);
      showSnackbar({text: 'Valitettavasti tiedoston avaus ei onnistunut!', closeButton: 'true'});
    }

    function parseJson(text) {
      let data = null;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch (error) {
          console.log('Error while parsing file content to JSON: ', error);
          showSnackbar({text: 'Tietueita ei voitu avata lukunäkymään, tarkista tiedosto', closeButton: 'true'});
        }
      }

      return data;
    }

    function parseLog(data) {
      if (data === null) {
        console.log('No json data for parsing log');
        showSnackbar({text: 'Tietueita ei voitu avata lukunäkymään, tarkista tiedosto', closeButton: 'true'});
        return;
      }

      if (data.melindaRecord === undefined && data.databaseRecord === undefined && data.mergedRecord === undefined && data.incomingRecord === undefined) {
        console.log('Records are undefined, invalid json data for parsing log')
        showSnackbar({text: 'Tietueita ei voitu avata lukunäkymään, tarkista tiedosto', closeButton: 'true'});
        return;
      }

      const log = Object.assign({}, data);
      log.logItemType = 'MERGE_LOG';
      log.blobSequence = 0;
      log.creationTime = data.creationTime || 'Ei saatavilla';
      log.databaseRecord = data.melindaRecord || data.databaseRecord;
      log.preference = {recordName: ((data.preferred === 'melindaRecord' ? 'databaseRecord' : data.preferred) || '')};
      delete log.melindaRecord;
      delete log.preferred;
      return log;
    }
  }
}

window.exitReaderMode = function (event) {
  console.log('Exiting Viewer reader mode');
  eventHandled(event);

  const toolbar = document.getElementById('viewerTools');
  const allElements = getAllDescendants(toolbar);

  allElements.forEach(element => enableElement(element));

  const readMode = document.getElementById('readMode');
  readMode.style.display = 'none';

  const exitButton = document.getElementById('exit');
  disableElement(exitButton);
  exitButton.style.display = 'none';

  clearLogView();
}

function showReaderMode() {
  console.log('Viewer is now in reader mode: records are read only');

  const sequenceInputField = document.getElementById('sequenceInput');
  const sequenceSelect = document.getElementById('sequence');
  sequenceInputField.style.display = 'block';
  sequenceSelect.style.display = 'none';

  const toolbar = document.getElementById('viewerTools');
  const allElements = getAllDescendants(toolbar);
  allElements.forEach(element => disableElement(element));

  const uploadButton = document.getElementById('import');
  enableElement(uploadButton);

  const exitButton = document.getElementById('exit');
  exitButton.style.display = 'block';
  enableElement(exitButton);

  const readMode = document.getElementById('readMode');
  readMode.style.display = 'flex';
}

function checkFile(file) {
  console.log('Checking uploaded file...');
  const confirmUploadButton = document.getElementById('confirmUploadButton');
  const fileNameDiv = document.getElementById('selectedFileName');

  if (!file) {
    console.log('No file to check!');
    disableElement(confirmUploadButton);
    return;
  }

  if (file.size === 0) {
    console.log('File is empty!');
    disableElement(confirmUploadButton);
    highlightElement(fileNameDiv, '#D6958B');
    showSnackbar({text: 'Tyhjää tiedostoa ei voi avata, tarkista tiedoston sisältö!', closeButton: 'true'});
    return;
  }

  if (file.type !== 'application/json' && file.type !== 'text/plain') {
    console.log(`File type '${file.type}' is not accepted for upload!`);
    confirmUploadButton.title = 'Valitse ensin .json- tai .txt-päätteinen tiedosto';
    disableElement(confirmUploadButton);
    highlightElement(fileNameDiv, '#D6958B');
    showSnackbar({text: 'Vain .json- tai .txt-tiedostot hyväksytään, tarkista tiedoston tyyppi!', closeButton: 'true'});
    return;
  }

  confirmUploadButton.removeAttribute('title');
  enableElement(confirmUploadButton);
  highlightElement(fileNameDiv, '#8AB59C');
}


//-----------------------------------------------------------------------------
// Functions for correlation id list modal 
//-----------------------------------------------------------------------------

window.openCorrelationIdListModal = function (event = undefined) {
  const modal = document.querySelector(`#correlationIdListModal`);

  modal.style.display = 'flex';
  clearListView();
  fetchCorrelationIdList();
}

window.updateOnChange = (event) => {
  eventHandled(event);
  updateCorrelationIdListModal();
}

window.ignore = function (event) {
  return eventHandled(event);
}

window.goToTop = function (event = undefined) {
  eventHandled(event);
  const modal = document.querySelector(`#correlationIdListModal`);
  modal.scrollTo({top: 0, behavior: 'smooth'});
}

window.modalClose = function (event) {
  const modal = document.querySelector('#correlationIdListModal');
  modal.style.display = 'none';
  return eventHandled(event);
}

window.toggleListDetails = function (event = undefined) {
  eventHandled(event);
  const toggleListDetailsButton = document.getElementById('toggleListDetails');
  toggleFilterButton(toggleListDetailsButton);
  updateOnChange(new Event('change'));
}

window.toggleShowLogsByCreationDate = function (clickedDateButton) {
  const dateStartInput = document.querySelector(`#correlationIdListModal #dateStartInput`);
  const dateEndInput = document.querySelector(`#correlationIdListModal #dateEndInput`);
  const todayButton = document.getElementById('creationTimeToday');
  const weekAgoButton = document.getElementById('creationTimeWeekAgo');

  const dateFormatter = Intl.DateTimeFormat('sv-SE');
  const dateToday = dateFormatter.format(new Date());
  const dateOverSevenDaysAgo = dateFormatter.format(new Date() - (7 * oneDayInMs));

  if (clickedDateButton === 'today') {
    toggleFilterButton(todayButton);

    todayButton.dataset.value === 'true'
      ? (dateStartInput.value = dateToday, dateEndInput.value = dateToday)
      : (dateStartInput.value = '', dateEndInput.value = '')

    if (todayButton.dataset.value === 'true' && weekAgoButton.dataset.value === 'true') {
      toggleFilterButton(weekAgoButton);
    }
  }

  if (clickedDateButton === 'weekAgo') {
    toggleFilterButton(weekAgoButton);

    weekAgoButton.dataset.value === 'true'
      ? (dateEndInput.value = dateOverSevenDaysAgo, dateStartInput.value = '')
      : (dateEndInput.value = '', dateEndInput.value = '')

    if (weekAgoButton.dataset.value === 'true' && todayButton.dataset.value === 'true') {
      toggleFilterButton(todayButton);
    }
  }

  updateOnChange(new Event('change'));

}

window.clearFilters = function ({event = undefined, clearDetailsFilter = 'true', clearLogTypeFilters = 'true', clearDateFilters = 'true', clearCatalogerFilters = 'true', clearInputFilters = 'true'}) {
  eventHandled(event);
  resetDateFilteringButtons();

  if (clearDetailsFilter === 'false' && clearLogTypeFilters === 'false' && clearCatalogerFilters === 'false' && clearDateFilters === 'true' && clearInputFilters === 'false') {
    return;
  }

  resetFilteringInputs();
  resetLogTypeFilteringButtons();
  resetCatalogerFilteringButtons();
  resetDetailsButton();
  console.log('All filters cleared!');
  updateOnChange(event);


  function resetDateFilteringButtons() {
    const todayButton = document.getElementById('creationTimeToday');
    const weekAgoButton = document.getElementById('creationTimeWeekAgo');
    unselectFilteringButtons(todayButton, weekAgoButton);
    setDefaultTitles(todayButton, weekAgoButton);

  }

  function resetFilteringInputs() {
    const dateStartInput = document.querySelector(`#correlationIdListModal #dateStartInput`);
    const dateEndInput = document.querySelector(`#correlationIdListModal #dateEndInput`);
    const correlationIdInput = document.getElementById(`correlationIdInput`);

    dateStartInput.value = '';
    dateEndInput.value = '';
    correlationIdInput.value = '';
  }

  function resetLogTypeFilteringButtons() {
    const logTypeButtons = document.getElementById('logTypeToggleContainer').children

    selectFilteringButtons(...logTypeButtons);
    setDefaultTitles(...logTypeButtons);
  }

  function resetDetailsButton() {
    const listDetailsSelect = document.querySelector(`#correlationIdListModal #toggleListDetails`);

    selectFilteringButtons(listDetailsSelect);
    setDefaultTitles(listDetailsSelect);
  }

  function resetCatalogerFilteringButtons() {
    const catalogerButtons = document.getElementById('catalogerToggleContainer').children

    selectFilteringButtons(...catalogerButtons);
    setDefaultTitles(...catalogerButtons);
  }

  function unselectFilteringButtons(...buttons) {
    buttons.forEach(button => (button.dataset.value = 'false', button.classList.remove('select-button-selected')));
  }

  function selectFilteringButtons(...buttons) {
    buttons.forEach(button => (button.dataset.value = 'true', button.classList.add('select-button-selected')));
  }

  function setDefaultTitles(...buttons) {
    buttons.forEach(button => button.title = button.dataset.titleA);
  }
}

function unselectDateButtons() {
  const todayButton = document.getElementById('creationTimeToday');
  const weekAgoButton = document.getElementById('creationTimeWeekAgo');

  if (todayButton.classList.contains('select-button-selected') || weekAgoButton.classList.contains('select-button-selected')) {
    clearFilters({clearDetailsFilter: 'false', clearLogTypeFilters: 'false', clearCatalogerFilters: 'false', clearDateFilters: 'true', clearInputFilters: 'false'});
  }
}

function toggleFilterButton(filterButton) {
  const filterButtonValue = filterButton.dataset.value;
  const titleA = filterButton.dataset.titleA;
  const titleB = filterButton.dataset.titleB;

  filterButton.dataset.value = (filterButtonValue === 'true' ? false : true);
  filterButton.classList.toggle('select-button-selected');
  filterButton.title = (filterButton.title === titleA ? titleB : titleA)
}

function clearListView() {
  const correlationIdList = document.querySelector(`#correlationIdListModal #correlationIdList`);
  const selectSorting = document.querySelector(`#correlationIdListModal #correlationIdListSorting`);
  const infoTextDiv = document.getElementById(`lastSearchedInfoText`);

  const dateStartInput = document.getElementById(`dateStartInput`);
  const dateEndInput = document.getElementById(`dateEndInput`);

  const filterButtons = document.querySelectorAll('.select-button');

  correlationIdList.replaceChildren();
  selectSorting.style.visibility = 'hidden';
  infoTextDiv.classList.remove('link-active');

  if (dateStartInput.value === '') {
    dateStartInput.setAttribute('type', 'text')
    dateStartInput.placeholder = 'Alkupvm'
  }

  if (dateEndInput.value === '') {
    dateEndInput.setAttribute('type', 'text')
    dateEndInput.placeholder = 'Loppupvm'
  }

  filterButtons.forEach((button) => {
    if (button.title === '') {
      button.title = button.dataset.titleA;
    }
  });

  setOrClearErrorMessageAndStyle({clear: 'true'});
}

function fetchCorrelationIdList() {
  const expanded = '1';

  startProcess();
  idbClearList();

  getCorrelationIdList(expanded)
    .then((data) => {
      testIfObjects(data);
      setCorrelationIdListDataToIndexDB(data);
    })
    .catch((error) => {
      setOrClearErrorMessageAndStyle({set: 'true', text: 'Valitettavasti listaa ei pystytty juuri nyt hakemaan'});
      console.log('Error while fetching correlation id list: ', error);
      stopProcess();
    });


  function testIfObjects(elements) {
    const objects = elements.filter(element => typeof element === 'object');

    if (objects.length !== elements.length) {
      throw new Error('Correlation id list should contain only objects')
    }
  }
}

function setOrClearErrorMessageAndStyle({clear = 'false', set = 'false', text = 'Sorry, something bad happened'}) {
  const errorMessagePlaceholder = document.getElementById('errorFetchingListPlaceholder');
  const errorMessage = document.querySelector(`#errorFetchingListPlaceholder .error-message-text`);
  const filteringButtonsDiv = document.getElementById('filteringButtons');
  const filteringInputsDiv = document.getElementById('filteringInputs');
  const searchResultsAndSortingDiv = document.getElementById('searchResultsAndSorting');
  const correlationIdListDiv = document.getElementById('correlationIdList');
  const modalBottomDiv = document.getElementById('modalBottomDiv');

  if (set === 'true') {
    errorMessagePlaceholder.style.display = 'flex';
    errorMessage.innerHTML = text;
    setDivsDisplayNone(searchResultsAndSortingDiv, correlationIdListDiv, modalBottomDiv);
    setDivsDisabled(filteringButtonsDiv, filteringInputsDiv);
  }

  if (clear === 'true') {
    errorMessagePlaceholder.style.display = 'none';
    errorMessage.innerHTML = '';
    setDivsDisplayFlex(searchResultsAndSortingDiv, correlationIdListDiv, modalBottomDiv);
    setDivsEnabled(filteringButtonsDiv, filteringInputsDiv);
  }

  function setDivsDisplayNone(...elements) {
    elements.forEach(element => element.style.display = 'none');
  }

  function setDivsDisabled(...elements) {
    elements.forEach(element => element.classList.add('disabled-div'));
  }

  function setDivsDisplayFlex(...elements) {
    elements.forEach(element => element.style.display = 'flex');
  }

  function setDivsEnabled(...elements) {
    elements.forEach(element => element.classList.remove('disabled-div'));
  }

}

function setCorrelationIdListDataToIndexDB(data) {
  idbSetList('correlationIdList', data);
  console.log('Correlation id list: ', data)
  updateOnChange(new Event('change'));
}

function updateCorrelationIdListModal() {
  clearListView();

  idbGetList('correlationIdList')
    .then((data) => {
      updateListView(data)
    })
    .catch((error) => {
      console.log('Error getting correlation id list from indexedDB (if undefined, probably it is not yet set): ', error);
      showSnackbar({text: 'Odota hetki listan päivittymistä', closeButton: 'true'})
    })
}

function updateListView(correlationIdList) {
  updateToggleButtons();
  const updatedList = filterAndSortCorrelationIdList();
  showSearchResultsInfo(updatedList.length, correlationIdList.length)

  if (updatedList.length === 0) {
    stopProcess();
    return;
  }

  updatedList.forEach((logItem) => createListItem(logItem));
  showListSortingOptions();
  showListDetails();
  highlightMatches();
  stopProcess();

  function updateToggleButtons() {
    updateFilterButtons('logTypeToggleContainer', 'logItemType');
    updateFilterButtons('catalogerToggleContainer', 'cataloger');

    function updateFilterButtons(containerId, filterProperty) {
      const currentList = [...document.querySelectorAll(`#${containerId} [id]`)].map((element) => element.id);
      const updatedList = Array.from(new Set(correlationIdList.map((listItem) => listItem[`${filterProperty}`])));

      // if null is present, change it to 'NULL'
      if (updatedList.includes(null)) [
        updatedList.splice(updatedList.indexOf(null), 1, 'NULL')
      ]

      const newItems = updatedList.filter(item => !currentList.includes(item));
      const oldItems = currentList.filter(item => !updatedList.includes(item));

      // move 'NULL' to be the last list item
      newItems.sort(item => item === 'NULL' ? 1 : -1)

      // TODO => handle case: if too many items, segmented button cannot be used
      addNew(newItems);
      removeOld(oldItems);

      function addNew(newItems) {
        newItems.forEach(item => {
          createNewButton(item);
        })

        function createNewButton(item) {
          const button = createButton(item);

          const container = document.getElementById(containerId);
          container.append(button);

          function createButton(item) {
            const template = document.getElementById('buttonTemplate');
            const buttonFragment = template.content.cloneNode(true);
            const button = buttonFragment.getElementById('segmentedSelectButton');

            button.id = item;
            button.querySelector(`.select-button-text`).innerHTML = item;
            button.dataset.titleA = `Piilota ${item} listanäkymästä`;
            button.dataset.titleB = `Näytä  ${item} listanäkymässä`;

            button.title = button.dataset.titleA;

            button.addEventListener('click', () => {
              toggleShowLogsByFilter(item);
            });

            return button;

            function toggleShowLogsByFilter(item) {
              const toggleItemButton = document.querySelector(`#correlationIdListModal #${item}`);
              toggleFilterButton(toggleItemButton);
              updateOnChange(new Event('change'));
            }
          }
        }
      }

      function removeOld(oldItems) {
        oldItems.forEach(item => {
          const element = document.getElementById(item);
          element.parentNode.removeChild(element);
        })
      }

    }
  }

  function filterAndSortCorrelationIdList(filterByLogTypes = 'true', filterByCatalogers = 'true', filterByDates = 'true', filterBySearchString = 'true', sortBySelected = 'true',) {
    const logTypeButtons = document.querySelectorAll(`#logTypeToggleContainer [id]`);
    const catalogerButtons = document.querySelectorAll(`#catalogerToggleContainer [id]`);
    const dateStartInputValue = document.getElementById(`dateStartInput`).value;
    const dateEndInputValue = document.getElementById(`dateEndInput`).value;
    const correlationIdInputValue = document.getElementById(`correlationIdInput`).value;
    const selectSortingValue = document.getElementById(`correlationIdListSorting`).value;

    let updatedList = correlationIdList;

    switch (true) {
      case (filterByLogTypes === 'true'):
        updatedList = filterListWithLogTypes(updatedList, logTypeButtons);
      case (filterByCatalogers === 'true'):
        updatedList = filterListWithCatalogers(updatedList, catalogerButtons);
      case (filterByDates === 'true'):
        updatedList = filterListWithDates(updatedList, dateStartInputValue, dateEndInputValue);
      case (filterBySearchString === 'true'):
        updatedList = filterListWithSearchString(updatedList, correlationIdInputValue);
      case (sortBySelected === 'true'):
        updatedList = sortList(updatedList, selectSortingValue);
      default:
        return updatedList;
    }

    function filterListWithLogTypes(list, logTypeButtons) {
      let selectedLogTypes = [];

      logTypeButtons.forEach(button => {
        if (button.dataset.value === 'true') {
          selectedLogTypes.push(button.id);
        }
      });

      // handle if logItemType is null
      list.map(logItem => {
        if (logItem.logItemType === null) {
          logItem.logItemType = 'NULL'
        }
      });

      return list.filter(logItem => selectedLogTypes.includes(logItem.logItemType));
    }

    function filterListWithCatalogers(list, catalogerButtons) {
      let selectedCatalogers = [];

      catalogerButtons.forEach(button => {
        if (button.dataset.value === 'true') {
          selectedCatalogers.push(button.id);
        }
      });

      // handle if cataloger is null
      list.map(logItem => {
        if (logItem.cataloger === null) {
          logItem.cataloger = 'NULL'
        }
      });

      return list.filter(logItem => selectedCatalogers.includes(logItem.cataloger));
    }

    function filterListWithDates(list, startDate, endDate) {
      switch (true) {
        case (startDate !== '' && endDate !== ''):
          return list.filter(logItem => getDate(logItem) >= startDate && getDate(logItem) <= endDate);
        case (startDate !== '' && endDate === ''):
          return list.filter(logItem => getDate(logItem) >= startDate);
        case (startDate === '' && endDate !== ''):
          return list.filter(logItem => getDate(logItem) <= endDate);
        default:
          return list;
      }

      function getDate(logItem) {
        return logItem.creationTime.substring(0, 10);
      }
    }

    function filterListWithSearchString(list, searchString) {
      return list.filter(logItem => logItem.correlationId.includes(searchString));
    }

    function sortList(list, sortingMethod) {
      switch (true) {
        case (sortingMethod === 'sortById'):
          return list.sort(compareLogItemsByIdAndType);
        case (sortingMethod === 'sortByTimeOldestFirst'):
          return list.sort(compareLogItemsByTime);
        case (sortingMethod === 'sortByTimeNewestFirst'):
          return list.sort(compareLogItemsByTime).reverse();
        default:
          return list;
      }

      function compareLogItemsByIdAndType(logItemA, logItemB) {
        return logItemA.correlationId.localeCompare(logItemB.correlationId) || logItemB.logItemType.localeCompare(logItemA.logItemType);
      }

      function compareLogItemsByTime(logItemA, logItemB) {
        return logItemA.creationTime.localeCompare(logItemB.creationTime);
      }

    }
  }

  function showSearchResultsInfo(found, total) {
    const styledResult = `<span class="styled-result">&nbsp;${found}&nbsp;</span>`
    showPlaceholderText(`Näytetään ${styledResult}/${total} ID:tä`)
  }

  function createListItem(logItem) {
    const listItemDiv = createListItemDiv(logItem);
    const correlationIdList = document.querySelector(`#correlationIdListModal #correlationIdList`);
    correlationIdList.append(listItemDiv);

    function createListItemDiv({correlationId, logItemType, cataloger, creationTime, logCount}) {
      const template = document.getElementById('listItemTemplate');
      const listItemFragment = template.content.cloneNode(true);
      const listItem = listItemFragment.getElementById('listItem');

      // logItem's correlationId is not unique, so the id for listItem containts two logItem attributes
      listItem.id = correlationId + ':' + logItemType;
      listItem.querySelector(`.list-item-id`).innerHTML = correlationId;

      const logTypeText = `Lokityyppi: <span style="font-weight: bold">${logItemType}</span>`;
      const catalogerText = `Luetteloija: <span style="font-weight: bold">${cataloger}</span>`;
      const creationTimeText = `Luontiaika: <span style="font-weight: bold">${creationTime.substring(0, 10)} ${creationTime.substring(11, 22)}</span>`;
      const logCountText = `Lokilukumäärä: <span style="font-weight: bold">${logCount}</span>`;

      const logTypeDiv = createDivWithInnerHtml(logTypeText);
      const catalogerDiv = createDivWithInnerHtml(catalogerText);
      const creationTimeDiv = createDivWithInnerHtml(creationTimeText);
      const logCountDiv = createDivWithInnerHtml(logCountText);

      listItem.querySelector(`.list-item-details`).append(logTypeDiv, catalogerDiv, creationTimeDiv, logCountDiv);

      listItem.addEventListener('click', () => {
        searchWithSelectedIdAndType(correlationId, logItemType);
      });

      const overWeekOld = Date.parse(logItem.creationTime) < Date.now() - (7 * oneDayInMs)

      if (overWeekOld) {
        const infoIcon = document.createElement('span');
        infoIcon.classList.add('material-icons');
        infoIcon.innerHTML = 'lock_clock';
        infoIcon.title = ('Tämä ID on yli 7 vrk vanha, joten se saattaa olla turvattu');
        listItem.querySelector(`.list-item-icons`).prepend(infoIcon);
      }

      return listItem;

      function createDivWithInnerHtml(text) {
        const divElement = document.createElement('div');
        divElement.innerHTML = text;
        return divElement;
      }

      function searchWithSelectedIdAndType(correlationId, logItemType) {
        const id = document.querySelector(`#viewer #id`);
        const logType = document.querySelector(`#viewer #logType`);
        const sequenceInputField = document.querySelector(`#viewer #sequenceInput`);
        const sequenceSelect = document.querySelector(`#viewer #sequence`);

        id.value = correlationId;
        logType.value = logItemType;
        sequenceInputField.value = '';
        sequenceSelect.value = '';

        doSearchPress();
        modalClose();
      }

    }
  }

  function showListSortingOptions() {
    const selectSorting = document.getElementById(`correlationIdListSorting`);
    selectSorting.style.visibility = 'visible';
  }

  function showListDetails() {
    const listDetailsDivs = document.querySelectorAll(`#correlationIdListModal #correlationIdList .list-item-details`);
    const showListDetailsValue = document.querySelector(`#correlationIdListModal #toggleListDetails`).dataset.value;
    listDetailsDivs.forEach((div) => (showListDetailsValue === 'true' ? div.style.display = 'flex' : div.style.display = 'none'));
  }

  function highlightMatches() {
    highlightSearchStringMatches();
    highlightLastSearchedListItem();

    function highlightSearchStringMatches() {
      const searchString = document.getElementById(`correlationIdInput`).value;

      if (searchString !== '') {
        stylePatternMatches(searchString);
      }

      function stylePatternMatches() {
        const listItemIdDivs = document.querySelectorAll(`#correlationIdListModal #correlationIdList .list-item-id`);

        const styledString = `<span style="background-color:lightgrey">${searchString}</span>`;
        const re = new RegExp(`${searchString}`, 'g');

        listItemIdDivs.forEach(listItemId => listItemId.innerHTML = listItemId.innerHTML.replace(re, styledString));
      }
    }

    function highlightLastSearchedListItem() {
      const lastSearchedCorrelationId = document.querySelector(`#lastSearchedInfoText span`)?.innerHTML;
      const lastSearchedLogType = document.getElementById(`logType`).value;
      const id = lastSearchedCorrelationId + ':' + lastSearchedLogType;
      const lastSearchedListItem = document.getElementById(id);

      if (!lastSearchedListItem) {
        return;
      }

      lastSearchedListItem.classList.add('last-searched')

      addSelectedIcon();
      updateSearchIcon();
      addLinkToListItem();

      function addSelectedIcon() {
        const selectedIcon = document.createElement('span');
        selectedIcon.classList.add('material-icons', 'selected-list-item-check-icon');
        selectedIcon.innerHTML = 'check';
        lastSearchedListItem.querySelector(`.list-item-icons`).append(selectedIcon);
      }

      function updateSearchIcon() {
        const searchIcon = document.querySelector(`.last-searched .list-item-icons-search`);
        searchIcon.innerHTML = 'find_replace';
        searchIcon.title = 'Hae uudelleen tällä ID:llä';
      }

      function addLinkToListItem() {
        const infoTextDiv = document.getElementById('lastSearchedInfoText');
        const infoTextSpan = document.querySelector(`#lastSearchedInfoText span`);

        infoTextDiv.classList.add('link-active');
        infoTextSpan.title = 'Siirry listanäkymässä tämän ID:n kohdalle'

        infoTextSpan.addEventListener('click', () => {
          lastSearchedListItem.scrollIntoView({behavior: 'smooth', block: 'center'});
          highlightElement(lastSearchedListItem);
        });

      }
    }
  }
}

function showPlaceholderText(text) {
  const placeholderText = document.getElementById('fetchListPlaceholderText');
  placeholderText.innerHTML = text;
}
