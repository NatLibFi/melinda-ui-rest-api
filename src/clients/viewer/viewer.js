//*****************************************************************************
//
// New "Reactless" Viewer Sketch
//
//*****************************************************************************

import {setNavBar, startProcess, stopProcess} from "/common/ui-utils.js";
import {showTab, resetForms, reload} from "/common/ui-utils.js";
import {createMenuBreak, createMenuItem, createMenuSelection} from "/common/ui-utils.js";

import {Account, doLogin, logout} from "/common/auth.js"
import {transformRequest} from "/common/rest.js";
import {showRecord} from "/common/marc-record-ui.js";
import {getMatchLog, getMergeLog, getCorrelationIdList, protectLog, removeLog} from "/common/rest.js";
import {idbSet, idbGet, idbClear} from "/viewer/indexDB.js";

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

  setNavBar(document.querySelector('#navbar'), "Viewer")
  const select = document.querySelector(`#viewer #sequence`);
  select.innerHTML = '';
  disableElement(select);

  doLogin(authSuccess);

  function authSuccess(user) {
    const username = document.querySelector("#account-menu #username")
    username.innerHTML = Account.get()["Name"];
    showTab('viewer');
    parseUrlParameters();
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

    document.querySelector(`#viewer #logType`).value = logType;
    const select = document.querySelector(`#viewer #sequence`);
    const seqOption = createOption(sequence, sequence);
    select.add(seqOption);
    select.value = sequence;

    window.history.pushState('', 'viewer', `/viewer/`);
  }
}

//-----------------------------------------------------------------------------

window.onAccount = function (e) {
  console.log('Account:', e);
  logout();
}

//-----------------------------------------------------------------------------
// Do button actions
//-----------------------------------------------------------------------------

var transformed = {
  record1: {},
  record2: {},
  record3: {}
}

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
  idbClear();

  const sequenceSelect = document.querySelector('#viewer #sequence');
  sequenceSelect.innerHTML = '';
  disableElement(sequenceSelect);
  const col3 = document.querySelector('#viewer #record3').parentElement;
  console.log('Fetching...');

  if (id === '') {
    console.log('Nothing to fetching...');
    return stopProcess();
  }

  if (logType === 'MERGE_LOG') {
    col3.style.display = 'block';
    getMergeLog(id).then(logs => setDataToIndexDB(logs, sequence));
  }

  if (logType === 'MATCH_LOG') {
    col3.style.display = 'none';
    getMatchLog(id).then(logs => setDataToIndexDB(logs, sequence));
  }

}

window.doOpenCorrelationIdListModal = function (event = undefined) {
  const modal = document.querySelector("#correlationIdListModal");
  modal.style.display = "flex";
  showCorrelationIdList();
}

window.doOpenDateStartPicker = function (event = undefined) {
  const dateStartInput = document.getElementById("dateStartInput");
  dateStartInput.showPicker();
}

window.doOpenDateEndPicker = function (event = undefined) {
  const dateEndInput = document.getElementById("dateEndInput");
  dateEndInput.showPicker();
}

window.updateOnChange = (event) => {
  eventHandled(event);
  updateCorrelationIdListView();
}

window.modalClose = function (event) {
  const modal = document.querySelector("#correlationIdListModal")
  modal.style.display = "none"
  return eventHandled(event);
}

window.ignore = function (event) {
  return eventHandled(event);
}

window.loadLog = (event) => {
  eventHandled(event);
  const logType = document.querySelector(`#viewer #logType`).value;
  const matchSelectWrap = document.querySelector('.col .header .Select');
  matchSelectWrap.style.visibility = 'hidden';
  const matchSelect = document.querySelector('.col .header #match');
  matchSelect.innerHTML = '';
  const protectButton = document.querySelector(`#viewer #protect`);
  const removeButton = document.querySelector(`#viewer #delete`);

  disableElement(removeButton);
  checkLogProtection();

  if (logType === 'MERGE_LOG') {

    idbGet(event.target.value).then(data => {
      setRecordTopInfo('record1', `Sisääntuleva tietue${data.preference.recordName === 'incomingRecord' ? ' (Suositaan)' : ''}`, false);
      showRecord(data.incomingRecord, "record1", {}, 'viewer');
      setRecordTopInfo('record2', `Melinda-tietue${data.preference.recordName === 'databaseRecord' ? ' (Suositaan)' : ''}`, false);
      showRecord(data.databaseRecord, "record2", {}, 'viewer');
      setRecordTopInfo('record3', 'Yhdistetty tietue', `<li>Luontiaika: ${data.creationTime}</li>`);
      showRecord(data.mergedRecord, "record3", {}, 'viewer');
    });
  }

  if (logType === 'MATCH_LOG') {
    idbGet(event.target.value).then(data => {
      if (data.matchResult && data.matchResult.length < 1) {
        matchSelect.add(createOption('notFound', '0'));
        matchSelect.value = 'notFound';
        return matchSelect.dispatchEvent(new Event('change'));
      }

      data.matchResult.forEach((result, index) => {
        matchSelect.add(createOption(result.matchSequence, index));
      });

      matchSelect.value = 0;
      matchSelect.dispatchEvent(new Event('change'));
    });
  }

  window.loadMatch = (event) => {
    eventHandled(event);
    const sequenceSelect = document.querySelector(`#viewer #sequence`).value;
    const matchSelectWrap = document.querySelector(`.col .header .Select`);
    showRecord({}, "record3", {}, 'viewer');

    if (event.target.value === 'notFound') {
      return idbGet(sequenceSelect).then(data => {
        matchSelectWrap.style.visibility = 'hidden';
        setRecordTopInfo('record1', 'Sisääntuleva tietue', false);
        showRecord(data.incomingRecord, "record1", {}, 'viewer');
        setRecordTopInfo('record2', 'Vastaava Melinda tietue', '<li>Ei löytynyt</li>');
        showRecord({}, "record2", {}, 'viewer');
      });
    }

    idbGet(sequenceSelect).then(data => {
      matchSelectWrap.style.visibility = data.matchResult.length > 1 ? 'visible' : 'hidden';
      setRecordTopInfo('record1', 'Sisääntuleva tietue', false);
      showRecord(data.incomingRecord, "record1", {}, 'viewer');
      const {record, note} = getMergeCandidateInfo(data.matchResult[event.target.value]);
      setRecordTopInfo('record2', 'Vastaava Melinda-tietue', note);
      showRecord(record, "record2", {}, 'viewer');
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
    idbGet(event.target.value)
      .then(log =>
        log.protected === true ? (setProtectButton('protected'), toggleRemoveButtonByLogAge(log.creationTime)) : setProtectButton('not protected'),
        enableElement(protectButton))
      .catch(error =>
        console.log(`Sorry, the protection status for log with sequence ${event.target.value} could not be checked: `, error));

    function toggleRemoveButtonByLogAge(logCreationTime) {
      const isOverWeekOld = Date.parse(logCreationTime) < (Date.now() - (7.5 * 24 * 60 * 60 * 1000))
      isOverWeekOld ? enableElement(removeButton) : disableElement(removeButton)
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

window.copyLink = function (event) {
  eventHandled(event);

  const logType = document.querySelector(`#viewer #logType`).value || '';
  const id = document.querySelector(`#viewer #id`).value || '';
  const sequence = document.querySelector(`#viewer #sequence`).value || '';
  if (id === '' || sequence === '') {
    navigator.clipboard.writeText(window.location);
    return;
  }

  navigator.clipboard.writeText(`${window.location}?id=${id}&logType=${logType}&sequence=${sequence}`);
}

window.protect = function (event = undefined) {
  eventHandled(event);
  console.log('Protecting...');
  startProcess();

  const id = document.querySelector(`#viewer #id`).value || '';
  const sequence = document.querySelector(`#viewer #sequence`).value || 1;
  const protectButton = document.querySelector(`#viewer #protect`);

  if (id === '') {
    console.log('Nothing to protect...');
    stopProcess();
    return;
  }

  protectLog(id, sequence)
    .then(() =>
      protectButton.innerHTML === 'lock_open' ? (setProtectButton('protected')) : (setProtectButton('not protected')))
    .catch(error =>
      console.log(`Error while trying to protect log with correlation id ${id} and sequence ${sequence}: `, error))
    .finally(() =>
      stopProcess());

}

window.remove = function (event = undefined) {
  eventHandled(event);
  console.log('Removing...');
  startProcess();

  const id = document.querySelector(`#viewer #id`).value || '';
  const force = true;

  if (id === '') {
    console.log('Nothing to remove...');
    stopProcess();
    return;
  }

  removeLog(id, force)
    .then(() =>
      window.alert(`Removed log with correlation id: \n ${id}`),
      location.reload())
    .catch(error =>
      console.log(`Error while trying to remove log with correlation id ${id}: `, error))
    .finally(() =>
      stopProcess());

}

function setDataToIndexDB(logs, sequence) {
  const select = document.querySelector(`#viewer #sequence`);
  console.log(JSON.stringify(logs));
  const keys = Object.keys(logs);

  if (keys.length === 0) {
    select.add(createOption('0', 0));
    idbSet('0', {incomingRecord: {}, databaseRecord: {}, mergedRecord: {}});
    stopProcess();
    // TODO toast 404 not found
    select.value = 0;
    return select.dispatchEvent(new Event('change'));;
  }

  const refactorLogs = Object.fromEntries(keys.map(key => [logs[key].blobSequence, logs[key]]));
  const refactoredKeys = Object.keys(refactorLogs);

  enableElement(select);
  refactoredKeys.forEach(key => {
    idbSet(key, refactorLogs[key]);
    select.add(createOption(key, key));
  });

  if (sequence !== 0 && refactoredKeys.includes(sequence)) {
    select.value = sequence;
  }

  const sequenceInputField = document.getElementById("sequenceInput");

  if (sequenceInputField.value !== '' && !refactoredKeys.includes(sequenceInputField.value)) {
    window.alert(`No search results for sequence "${sequenceInputField.value}"`);
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

function createOption(text, value) {
  const option = document.createElement("option");
  option.text = text;
  option.value = value;

  return option;
}

function setProtectButton(type) {
  const protectButton = document.querySelector(`#viewer #protect`);

  switch (true) {
    case (type === 'protected'):
      setProtectButtonProperties('lock', 'This log is currently protected, click to undo protection', 'Undo protect');
      break;
    case (type === 'not protected'):
      setProtectButtonProperties('lock_open', 'Click to protect this log', 'Protect');
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

function enableElement(element) {
  element.removeAttribute('disabled');
}

function disableElement(element) {
  element.disabled = true;
}

//-----------------------------------------------------------------------------
// Functions for correlation id list modal 
//-----------------------------------------------------------------------------

var correlationIdList = null;

function showCorrelationIdList() {
  const expanded = '1';

  startProcess();

  getCorrelationIdList(expanded)
    .then(list =>
      correlationIdList = list)
    .then(() =>
      updateCorrelationIdListView())
    .catch((error) => {
      showPlaceholderText('Sorry, correlation id list could not be fetched')
      clearList();
      stopProcess();
    });

}

function updateCorrelationIdListView() {
  clearList();
  const selectSorting = document.getElementById("correlationIdListSorting");
  const dateStartInputValue = document.getElementById("dateStartInput").value;
  const dateEndInputValue = document.getElementById("dateEndInput").value;

  const filteredList = filterList(dateStartInputValue, dateEndInputValue);
  const sortedList = sortList(filteredList, selectSorting.value);

  if (sortedList.length === 0) {
    showPlaceholderText('No correlation ids found, please check your search filters.');
    return;
  }

  showPlaceholderText('Found ' + sortedList.length + '/' + correlationIdList.length + ' correlation ids')
  selectSorting.style.display = 'block';
  sortedList.forEach((logItem) => createLogItemButton(logItem));
  stopProcess();
}

function clearList() {
  const buttonsList = document.getElementById('correlationIdListButtons');
  buttonsList.replaceChildren();
  const selectSorting = document.getElementById("correlationIdListSorting");
  selectSorting.style.display = 'none';
}

function filterList(startDate, endDate) {
  switch (true) {
    case (startDate !== '' && endDate !== ''):
      return correlationIdList.filter(logItem => getDate(logItem) >= startDate && getDate(logItem) <= endDate);
    case (startDate !== '' && endDate === ''):
      return correlationIdList.filter(logItem => getDate(logItem) >= startDate);
    case (startDate === '' && endDate !== ''):
      return correlationIdList.filter(logItem => getDate(logItem) <= endDate);
    default:
      return correlationIdList;
  }

  function getDate(logItem) {
    return logItem.creationTime.substring(0, 10);
  }
}

function sortList(list, sortingMethod) {
  switch (true) {
    case (sortingMethod === 'sortById'):
      return list.sort(compareLogItemsByIdAndType);
    case (sortingMethod === 'sortByTime'):
      return list.sort(compareLogItemsByTime);
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

function createLogItemButton(logItem) {
  const logItemButton = createButtonElement(logItem);
  const buttonsList = document.getElementById('correlationIdListButtons');
  buttonsList.append(logItemButton);

  function createButtonElement({correlationId, logItemType, creationTime, logCount}) {
    const button = document.createElement('button');
    button.innerHTML = correlationId + ' | ' + logItemType;

    const logIteminfoText =
      `Correlation id: ${correlationId}
        Log type: ${logItemType}
        Creation time: ${creationTime.substring(0, 10)} ${creationTime.substring(11, 22)}
        Log count: ${logCount}`;

    button.title = logIteminfoText;

    if (logItemType === 'MERGE_LOG') {
      button.className = 'merge-log-button';
    }

    if (logItemType === 'MATCH_LOG') {
      button.className = 'match-log-button';
    }

    const selectedId = document.querySelector(`#viewer #id`).value;
    const selectedLogType = document.querySelector(`#viewer #logType`).value;
    if (correlationId === selectedId && logItemType === selectedLogType) {
      button.classList.add('selected-id');
    }

    button.addEventListener("click", function () {
      searchWithSelectedIdAndType(correlationId, logItemType);
    });

    return button;
  }

  function searchWithSelectedIdAndType(correlationId, logItemType) {
    const id = document.querySelector(`#viewer #id`);
    id.value = correlationId;

    const logType = document.querySelector(`#viewer #logType`);
    logType.value = logItemType;

    doSearchPress();
    modalClose();
  }

}

function showPlaceholderText(text) {
  const placeholderText = document.getElementById('fetchListPlaceholderText');
  placeholderText.innerHTML = text;
}
