//*****************************************************************************
//
// New "Reactless" Viewer Sketch
//
//*****************************************************************************

import {
  showTab, startProcess, stopProcess, showNotification, showServerNotifications,
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
import {setOnHelpClicked} from '/common/helpUrl.js';

//-----------------------------------------------------------------------------------------
// Initialize on page load
//-----------------------------------------------------------------------------------------

window.initialize = function () {
  console.log('Initializing');

  const select = document.querySelector(`#viewer #sequence`);
  select.innerHTML = '';
  disableElement(select);

  showServerNotifications({clientName: 'viewer', onSuccess: ()=>{doLogin(authSuccess);}});

  function authSuccess(user) {
    const accountMenu = document.getElementById('accountMenu');
    accountMenu.classList.add('show');
    const username = document.querySelector(`#accountMenu #username`);
    username.innerHTML = Account.get().name;
    setOnHelpClicked({elementId:'helpButton', clientName: 'viewer'});
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
      showNotification({componentStyle: 'banner', style: 'info', text: 'Haetaan linkin tietuetta...'});
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
  const idInputField = document.querySelector(`#viewer #id`);
  console.log('Fetching...');

  if (id === '') {
    showNotification({componentStyle: 'banner', style: 'alert', text: 'Lisää ID haun aloittamista varten'});
    highlightElement(idInputField);
    console.log('Nothing to fetch...');
    return stopProcess();
  }

  updateInfoTextWithSearchedId();

  if (logType === 'MERGE_LOG') {
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
    showNotification({componentStyle: 'banner', style: 'error', text: `ID:tä '${id}' lokityypillä '${logType}' ei valitettavasti pystytty hakemaan!`, linkButton: button});
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

  const logTypeSelect = document.querySelector(`#viewer #logType`);
  const logType = document.querySelector(`#viewer #logType`).value;
  const idInputField = document.querySelector(`#viewer #id`);
  const sequenceInputField = document.querySelector(`#viewer #sequenceInput`);
  const sequenceSelect = document.querySelector(`#viewer #sequence`);

  const previousButton = document.querySelector(`#viewer #previousSequence`);
  const nextButton = document.querySelector(`#viewer #nextSequence`);
  const clearButton = document.querySelector(`#viewer #clearLogs`);
  const protectButton = document.querySelector(`#viewer #protect`);
  const removeButton = document.querySelector(`#viewer #delete`);

  const col2 = document.querySelector('#viewer #record2').parentElement;
  const col3 = document.querySelector('#viewer #record3').parentElement;
  const col4 = document.querySelector('#viewer #record4').parentElement;

  const matchSelectWrap = document.querySelector('.col .header .Select');
  matchSelectWrap.style.visibility = 'hidden';

  const matchSelect = document.querySelector('.col .header #match');
  matchSelect.innerHTML = '';

  if (logType === 'EMPTY_LOG') {
    console.log('Clearing record view');

    const downloadButton = document.getElementById('export');
    const infoCol1 = document.querySelector(`#viewer #recordsInfo #panelContent #infoCol1`);
    const infoCol2 = document.querySelector(`#viewer #recordsInfo #panelContent #infoCol2`);

    idInputField.value = '';
    logTypeSelect.value = 'MERGE_LOG';
    sequenceInputField.value = '';
    sequenceSelect.replaceChildren();
    sequenceSelect.value = '';

    col2.style.display = 'block';
    col3.style.display = 'block';
    col4.style.display = 'none';
    sequenceInputField.style.display = 'block';
    sequenceSelect.style.display = 'none';

    disableElement(previousButton);
    disableElement(nextButton);
    disableElement(clearButton);
    disableElement(protectButton);
    disableElement(removeButton);
    disableElement(downloadButton);

    setRecordTopInfo('record1', `Sisääntuleva tietue`);
    showRecord({}, 'record1', {}, 'viewer');
    setRecordTopInfo('record2', `Melinda-tietue`);
    showRecord({}, 'record2', {}, 'viewer');
    setRecordTopInfo('record3', 'Yhdistetty tietue');
    showRecord({}, 'record3', {}, 'viewer');

    infoCol1.innerHTML = '';
    infoCol2.innerHTML = '';

    return;
  }

  enableElement(clearButton);
  checkLogProtection();
  updateSequenceView();

  if (logType === 'MERGE_LOG') {
    idbGetLogs(event.target.value).then(data => {

      if (data.logItemType !== 'MERGE_LOG') {
        alertLogTypeChange(data.logItemType);
        return;
      }

      addLogInfo(data);

      col2.style.display = 'block';
      col3.style.display = 'block';
      col4.style.display = 'none';

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

      if (data.logItemType !== 'MATCH_LOG') {
        alertLogTypeChange(data.logItemType);
        return;
      }

      if (!data.matchResult) {
        showNotification({componentStyle: 'banner', style: 'error', text: 'Valitettavasti vastaavan Melinda-tietueen lukeminen ei onnistunut, tarkista loki.'});
        console.log('No property "matchResult" found in loaded log data.');
        return;
      }

      addLogInfo(data);

      col2.style.display = 'none';
      col3.style.display = 'none';
      col4.style.display = 'block';

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

  function alertLogTypeChange(dataLogType) {
    if (dataLogType === undefined) {
      return;
    }

    const tempId = idInputField.value
    const tempLogType = logTypeSelect.value;
    const tempSequence = sequenceSelect.value
    clearLogView();
    showNotification({componentStyle: 'banner', style: 'error', text: 'Valitettavasti lokin haku ei onnistunut, tarkista hakukentät ja hae uudelleen'});
    console.log('The selected log type does not match the logItemType in the data: no records loaded for viewing.');
    idInputField.value = tempId;
    logTypeSelect.value = tempLogType;
    sequenceInputField.value = tempSequence;
    enableElement(clearButton);
  }

  function addLogInfo(data) {
    const infoCol1 = document.querySelector(`#viewer #recordsInfo #panelContent #infoCol1`)
    const infoCol2 = document.querySelector(`#viewer #recordsInfo #panelContent #infoCol2`)

    const logInfo1 = [
      createInfo('ID', data.correlationId),
      createInfo('Sekvenssi', data.blobSequence),
      createInfo('Lokityyppi', data.logItemType),
      createInfo('Luontiaika', data.creationTime),
      createInfo('Muokkausaika', data.modificationTime),
      createInfo('Turvattu', (data.protected === undefined ? '' : (data.protected === true ? 'Kyllä' : 'Ei')))
    ];

    const logInfo2 = [
      createInfo('Luetteloija', data.cataloger),
      createInfo('Nimeke', data.title),
      createInfo('Tunnisteet', createUlHtml(data.standardIdentifiers)),
      createInfo('Lähde-ID:t', createUlHtml(data.sourceIds)),
      createInfo('Vastaavuusraportit', createUlHtml(data.matcherReports, formatMatchReport))
    ];

    infoCol1.innerHTML = createUlHtml(logInfo1)
    infoCol2.innerHTML = createUlHtml(logInfo2);
  }
};

function createInfo(infoName, infoData) {
  return `<b>${infoName}:</b> ${infoData ? infoData : '<i>Tieto puuttuu lokista</i>'}`;
}

function createUlHtml(liHtmlArray, itemFormatter = undefined) {
  if (liHtmlArray === undefined) {
    return '';
  }

  let listContent = '';

  liHtmlArray.forEach(arrayItem => {
    listContent = listContent + createLiHtml(itemFormatter ? itemFormatter(arrayItem) : arrayItem);
  })

  return `<ul>${listContent}</ul>`;
}

function createLiHtml(listItem) {
  return `<li>${listItem}</li>`;
}

window.loadMatch = (event) => {
  eventHandled(event);
  const sequenceSelect = document.querySelector(`#viewer #sequence`).value;
  const matchSelectWrap = document.querySelector(`.col .header .Select`);

  idbGetLogs(sequenceSelect).then(data => {
    matchSelectWrap.style.visibility = data.matchResult.length > 1 ? 'visible' : 'hidden';
    setRecordTopInfo('record1', 'Sisääntuleva tietue', false);
    showRecord(data.incomingRecord, 'record1', {}, 'viewer');
    if (data.matchResult.length === 0) {
      setRecordTopInfo('record4', 'Vastaava Melinda-tietue', '<ul><li>Ei löytynyt</li></ul>');
      showRecord({}, 'record4', {}, 'viewer');
      return;
    }
    const {record, note} = getMergeCandidateInfo(data.matchResult[event.target.value]);
    setRecordTopInfo('record4', 'Vastaava Melinda-tietue', note);
    showRecord(record, 'record4', {}, 'viewer');
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

  const note = createUlHtml([
    createInfo('Melinda-ID', id),
    createInfo('Käypäisyys', probability * 100 + '%'),
    createInfo('Yhdistämistapa', action),
    createInfo('Yhdistäessä pohjana', preferenceRecord === undefined ? 'Ei yhdistetä' : (preferenceRecord === 'A' ? 'Sisääntuleva' : 'Melinda-tietue')),
    createInfo('Peruste', preference),
    createInfo('Vastaavuusraportit', matcherReports.length > 0 ? createUlHtml(matcherReports, formatMatchReport) : 'Ei raportteja')
  ])

  return {
    record,
    note
  };
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
    document.querySelector(`#viewer #${record} .note`).innerHTML = `${additional}`;
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
    showNotification({componentStyle: 'banner', style: 'alert', text: 'Valitettavasti tälle ID:lle ei löytynyt vastaavaa tietuetta'});
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
    showNotification({componentStyle: 'banner', style: 'alert', text: `Ei hakutuloksia sekvenssille '${sequenceInputField.value}', näytetään sekvenssi ${select.value}`});
    highlightElement(select);
  }

  sequenceInputField.value = '';

  select.dispatchEvent(new Event('change'));

  stopProcess();
}
