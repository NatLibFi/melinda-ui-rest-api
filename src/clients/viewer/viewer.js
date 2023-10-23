//*****************************************************************************
//
// New "Reactless" Viewer Sketch
//
//*****************************************************************************

import {
  showTab, startProcess, stopProcess, showSnackbar,
  createOption, enableElement, disableElement, highlightElement
} from '/common/ui-utils.js';

import {
  idbGetLogs, idbSetLogs, idbClearLogs,
  doIndexedDbCheck, idbClearList
} from '/viewer/indexDB.js';

import {Account, doLogin, logout} from '/common/auth.js';
import {showRecord} from '/common/marc-record-ui.js';
import {getMatchLog, getMergeLog} from '/common/rest.js';
import {unselectDateButtons, oneDayInMs} from './searchModal.js';
import {checkFile} from './fileHandling.js';
import {setProtectButton} from './logActions.js';

//-----------------------------------------------------------------------------------------
// Initialize on page load
//-----------------------------------------------------------------------------------------

window.initialize = function () {
  console.log('Initializing');

  const select = document.querySelector(`#viewer #sequence`);
  select.innerHTML = '';
  disableElement(select);

  doLogin(authSuccess);

  function authSuccess(user) {
    const accountMenu = document.getElementById('accountMenu');
    accountMenu.classList.add('show');
    const username = document.querySelector(`#accountMenu #username`);
    username.innerHTML = Account.get().Name;
    showTab('viewer');
    parseUrlParameters();
    doIndexedDbCheck();
    addSearchModalEventListeners();
    addFileDialogEventListeners();
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
      showSnackbar({style: 'info', text: 'Haetaan linkin tietuetta...'});
    }
  }

  // event listeners for some elements for the correlation id list modal
  function addSearchModalEventListeners() {
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
      scrollToTopButton.style.display = modal.scrollTop > 100 ? 'block' : 'none';
    });
  }

  // event listeners for some elements in the dialog for file upload
  function addFileDialogEventListeners() {
    const fileInput = document.getElementById('fileUpload');
    const fileNameDiv = document.getElementById('selectedFileName');
    const clearFileSelectButton = document.getElementById('clearFileSelect');

    fileInput.addEventListener('change', event => {
      eventHandled(event);

      const file = fileInput.files[0];
      checkFile(file);

      file
        ? (fileNameDiv.innerHTML = file.name, fileNameDiv.classList.add('file-selected'), clearFileSelectButton.style.display = 'flex')
        : (fileNameDiv.innerHTML = 'Ei valittua tiedostoa', fileNameDiv.classList.remove('file-selected'), clearFileSelectButton.style.display = 'none');

    });

  }
};

//-----------------------------------------------------------------------------------------
// Function for logging out from app
//-----------------------------------------------------------------------------------------

window.onAccount = function (e) {
  console.log('Account:', e);
  logout();
};

//-----------------------------------------------------------------------------------------
// Functions to start search for log, browse records and clear view 
//-----------------------------------------------------------------------------------------

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
};

window.clearLogView = function (event = undefined) {
  eventHandled(event);
  const logType = document.querySelector(`#viewer #logType`);
  const sequenceSelect = document.querySelector(`#viewer #sequence`);

  logType.value = 'EMPTY_LOG';

  idbClearLogs();
  idbClearList();

  return sequenceSelect.dispatchEvent(new Event('change'));
};

window.selectPrevious = function (event) {
  eventHandled(event);
  const select = document.querySelector(`#viewer #sequence`);
  setNewSelect(select.selectedIndex - 1);
};

window.selectNext = function (event) {
  eventHandled(event);
  const select = document.querySelector(`#viewer #sequence`);
  setNewSelect(select.selectedIndex + 1);
};

window.showLogInfo = function (event) {
  eventHandled(event);
  const logInfoPanel = document.querySelector(`#viewer #recordsInfo`);
  const hideLogInfoButton = document.getElementById('hideLogInfo');
  const showLogInfoButton = document.getElementById('showLogInfo');

  logInfoPanel.style.display = 'flex';
  showLogInfoButton.style.display = 'none';
  enableElement(hideLogInfoButton);
  hideLogInfoButton.style.display = 'flex';
};

window.hideLogInfo = function (event) {
  eventHandled(event);
  const logInfoPanel = document.querySelector(`#viewer #recordsInfo`);
  const hideLogInfoButton = document.getElementById('hideLogInfo');
  const showLogInfoButton = document.getElementById('showLogInfo');

  logInfoPanel.style.display = 'none';
  enableElement(showLogInfoButton);
  showLogInfoButton.style.display = 'flex';
  hideLogInfoButton.style.display = 'none';
};

function setNewSelect(newIndex) {
  const select = document.querySelector(`#viewer #sequence`);

  select.selectedIndex = newIndex;

  const newEvent = new Event('change');
  newEvent.data = select;
  select.dispatchEvent(newEvent);
}


//-----------------------------------------------------------------------------------------
// Functions to fetch log, set it to indexedDB and load record for viewing with notes
//-----------------------------------------------------------------------------------------

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
    showSnackbar({style: 'alert', text: 'Lisää ID haun aloittamista varten'});
    highlightElement(idInputField);
    console.log('Nothing to fetch...');
    return stopProcess();
  }

  updateInfoTextWithSearchedId();

  if (logType === 'MERGE_LOG') {
    col3.style.display = 'block';
    enableElement(downloadFileButton);

    getMergeLog(id)
      .then(logs => setDataToIndexDB(logs, sequence))
      .catch(error => {
        showLogError();
        console.log('Error fetching merge log: ', error);
        return stopProcess();
      });
  }

  if (logType === 'MATCH_LOG') {
    col3.style.display = 'none';
    enableElement(downloadFileButton);

    getMatchLog(id)
      .then(logs => setDataToIndexDB(logs, sequence))
      .catch(error => {
        showLogError();
        console.log('Error fetching match log: ', error);
        return stopProcess();
      });
  }

  function updateInfoTextWithSearchedId() {
    const infoTextDiv = document.getElementById(`lastSearchedInfoText`);
    infoTextDiv.innerHTML = `Edellinen haku: <span class="correlation-id-font">${id}</span`;
    infoTextDiv.title = '';
  }

  function showLogError() {
    const clearButton = document.querySelector(`#viewer #clearLogs`);
    const protectButton = document.querySelector(`#viewer #protect`);
    const removeButton = document.querySelector(`#viewer #delete`);

    const button = createClearViewButton();
    showSnackbar({style: 'error', text: `ID:tä '${id}' lokityypillä '${logType}' ei valitettavasti pystytty hakemaan!`, linkButton: button});
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

};

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
    disableElement(clearButton);
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
      addLogInfo([
        `<li>Luontiaika: ${data.creationTime}</li>`,
        `<li>Luetteloija: ${data.cataloger}</li>`,
        `<li>LähdeID:t: ${data.sourceIds}</li>`,
        `<li>Nimike: ${data.title}</li>`,
        `<li>Tunnisteet: ${data.standardIdentifiers}</li>`,
        `<li>Turvattu: ${data.protected ? 'Kyllä' : 'Ei'}</li>`,
      ]);

      setRecordTopInfo('record1', `Sisääntuleva tietue${data.preference.recordName === 'incomingRecord' ? ' (Suositaan)' : ''}`, false);
      showRecord(data.incomingRecord, 'record1', {}, 'viewer');
      setRecordTopInfo('record2', `Melinda-tietue${data.preference.recordName === 'databaseRecord' ? ' (Suositaan)' : ''}`, false);
      showRecord(data.databaseRecord, 'record2', {}, 'viewer');
      setRecordTopInfo('record3', 'Yhdistetty tietue');
      showRecord(data.mergedRecord, 'record3', {}, 'viewer');
    });

    return;
  }

  if (logType === 'MATCH_LOG') {
    idbGetLogs(event.target.value).then(data => {
      addLogInfo([
        `<li>Luontiaika: ${data.creationTime}</li>`,
        `<li>Luetteloija: ${data.cataloger}</li>`,
        `<li>LähdeID:t: ${data.sourceIds}</li>`,
        `<li>Nimike: ${data.title}</li>`,
        `<li>Tunnisteet: ${data.standardIdentifiers}</li>`,
        `<li>Turvattu: ${data.protected ? 'Kyllä' : 'Ei'}</li>`,
        `<li>Kaikki vastaavuusraportit: ${formatMatchReportList(data.matcherReports)}</li>`
      ]);

      data.matchResult.forEach((result, index) => {
        matchSelect.add(createOption(result.matchSequence, index));
      });

      if (data.matchResult && data.matchResult.length === 0) {
        matchSelect.add(createOption('notFound', 0));
      }

      matchSelect.value = 0;
      matchSelect.dispatchEvent(new Event('change'));
    });
    return;
  }

  function checkLogProtection() {
    disableElement(removeButton);

    idbGetLogs(event.target.value)
      .then(
        log => log.protected === true ? (setProtectButton('protected'), toggleRemoveButtonByLogAge(log.creationTime)) : setProtectButton('not protected'),
        enableElement(protectButton)
      )
      .catch(error => console.log(`Sorry, the protection status for log with sequence ${event.target.value} could not be checked: `, error));

    function toggleRemoveButtonByLogAge(logCreationTime) {
      const isOverWeekOld = Date.parse(logCreationTime) < Date.now() - 7 * oneDayInMs;
      isOverWeekOld ? enableElement(removeButton) : disableElement(removeButton);
    }
  }

  function updateSequenceView() {
    sequenceInputField.style.display = 'none';
    sequenceSelect.style.display = 'block';

    disableElement(nextButton);
    disableElement(previousButton);

    if (sequenceSelect.selectedIndex !== 0) {
      enableElement(previousButton);
    }

    if (sequenceSelect.selectedIndex < sequenceSelect.length - 1) {
      enableElement(nextButton);
    }
  }

  function addLogInfo(logInfo) {
    const infoList = document.querySelector(`#viewer #recordsInfo #panelContent #infoList`)
    infoList.innerHTML = '';

    logInfo.forEach(info => {
      infoList.insertAdjacentHTML('beforeend', info)
    })
  }
};

window.loadMatch = (event) => {
  eventHandled(event);
  const sequenceSelect = document.querySelector(`#viewer #sequence`).value;
  const matchSelectWrap = document.querySelector(`.col .header .Select`);
  showRecord({}, 'record3', {}, 'viewer');

  idbGetLogs(sequenceSelect).then(data => {
    matchSelectWrap.style.visibility = data.matchResult.length > 1 ? 'visible' : 'hidden';
    setRecordTopInfo('record1', 'Sisääntuleva tietue', false);
    showRecord(data.incomingRecord, 'record1', {}, 'viewer');
    if (data.matchResult.length === 0) {
      setRecordTopInfo('record2', 'Vastaava Melinda tietue', '<li>Ei löytynyt</li>');
      showRecord({}, 'record2', {}, 'viewer');
      return;
    }
    const {record, note} = getMergeCandidateInfo(data.matchResult[event.target.value]);
    setRecordTopInfo('record2', 'Vastaava Melinda-tietue', note);
    showRecord(record, 'record2', {}, 'viewer');
  });
};

function getMergeCandidateInfo(data) {
  const record = data?.candidate?.record;
  const id = data?.candidate?.id;
  const probability = data?.probability;
  const action = data?.action !== false ? data.action : 'Ei yhdistetä';
  const preferenceRecord = data?.preference?.value;
  const preference = data?.preference !== false ? data.preference.name : data?.message;
  const matcherReports = data?.matcherReports;

  const note = `
    <li>Melinda-ID: ${id}</li>
    <li>Käypäisyys: ${probability * 100}%</li>
    <li>Yhdistämistapa: ${action}</li>
    <li>Yhdistäessä pohjana: ${preferenceRecord === undefined ? 'Ei yhdistetä' : preferenceRecord === 'A' ? 'Sisääntuleva' : 'Melinda-tietue'}</li>
    <li>Peruste: ${preference}</li>
    <li>Vastaavuusraportit: ${matcherReports.length > 0 ? formatMatchReportList(matcherReports) : 'Ei raportteja'}</li>
  `
  return {
    record,
    note
  };
}


function formatMatchReportList(matcherReportsArray) {
  let matchReports = '';

  matcherReportsArray.forEach(matchReport => {
    matchReports = matchReports + `<li>${formatMatchReport(matchReport)}</li>`;
  })

  return `<ul>${matchReports}</ul>`;
}

function formatMatchReport(matchReportObject) {

  const {
    candidateCount,
    conversionFailureCount,
    matchAmount,
    matcherError,
    matcherErrored,
    matcherName,
    matcherSequence,
    matchStatus,
    matchIds
  } = matchReportObject

  const matchReport = `
    ${matcherName} (${matcherSequence}): ${(matchAmount >= 0 && candidateCount >= 0) ? `${matchAmount}/${candidateCount} osumaa` : ''}
    ${matchIds?.length > 0 ? `- ID:t ${matchIds} ` : ''}
    ${matchStatus?.status === false ? `- Keskeytynyt: "${matchStatus?.stopReason}"` : ''}
    ${conversionFailureCount > 0 ? `- Muunnosvirhelkm: ${conversionFailureCount}` : ''}
    ${matcherErrored === true ? `- Virhe: "${matcherError}"` : ''}
  `;

  return matchReport;
}

function setRecordTopInfo(record, title, additional = false) {
  document.querySelector(`#viewer #${record} .title`).innerHTML = `${title}`;

  if (additional === false) {
    document.querySelector(`#viewer #${record} .note`).style.display = 'none';
    document.querySelector(`#viewer #${record} #showNote`).style.display = 'none';
    document.querySelector(`#viewer #${record} #hideNote`).style.display = 'none';
  }

  if (additional !== false) {
    document.querySelector(`#viewer #${record} .note`).style.display = 'flex';
    document.querySelector(`#viewer #${record} .additional`).innerHTML = `${additional}`;
    document.querySelector(`#viewer #${record} #showNote`).style.display = 'none';
    document.querySelector(`#viewer #${record} #hideNote`).style.display = 'flex';
  }
}

window.showNote = (event, record) => {
  eventHandled(event);
  document.querySelector(`#viewer #${record} #showNote`).style.display = 'none';
  document.querySelector(`#viewer #${record} #hideNote`).style.display = 'flex';
  document.querySelector(`#viewer #${record} .note`).style.display = 'flex';
};

window.hideNote = (event, record) => {
  eventHandled(event);
  document.querySelector(`#viewer #${record} #showNote`).style.display = 'flex';
  document.querySelector(`#viewer #${record} #hideNote`).style.display = 'none';
  document.querySelector(`#viewer #${record} .note`).style.display = 'none';
};

export function setDataToIndexDB(logs, sequence) {
  const select = document.querySelector(`#viewer #sequence`);
  console.log(JSON.stringify(logs));
  const keys = Object.keys(logs);

  if (keys.length === 0) {
    const protectButton = document.querySelector(`#viewer #protect`);
    select.add(createOption('0', 0));
    idbSetLogs('0', {incomingRecord: {}, databaseRecord: {}, mergedRecord: {}});
    select.value = 0;
    disableElement(protectButton);
    showSnackbar({style: 'alert', text: 'Valitettavasti tälle ID:lle ei löytynyt vastaavaa tietuetta'});
    stopProcess();
    return select.dispatchEvent(new Event('change'));
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
    showSnackbar({style: 'alert', text: `Ei hakutuloksia sekvenssille '${sequenceInputField.value}', näytetään sekvenssi ${select.value}`});
    highlightElement(select);
  }

  sequenceInputField.value = '';

  select.dispatchEvent(new Event('change'));

  stopProcess();
}
