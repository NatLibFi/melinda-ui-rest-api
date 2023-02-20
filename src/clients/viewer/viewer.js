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
import {idbSetLogs, idbGetLogs, idbClearLogs, idbSetList, idbGetList, idbClearList} from "/viewer/indexDB.js";

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
  idbClearLogs();

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
  const modal = document.querySelector(`#correlationIdListModal`);
  const dateStartInput = document.querySelector(`#correlationIdListModal #dateStartInput`);
  const dateEndInput = document.querySelector(`#correlationIdListModal #dateEndInput`);

  modal.style.display = 'flex';
  dateStartInput.addEventListener('click', function (event) {event.stopPropagation();}, false);
  dateEndInput.addEventListener('click', function (event) {event.stopPropagation();}, false);

  fetchCorrelationIdList();
}

window.updateOnChange = (event) => {
  eventHandled(event);
  updateCorrelationIdListModal();
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

  checkLogProtection();

  if (logType === 'MERGE_LOG') {

    idbGetLogs(event.target.value).then(data => {
      setRecordTopInfo('record1', `Sisääntuleva tietue${data.preference.recordName === 'incomingRecord' ? ' (Suositaan)' : ''}`, false);
      showRecord(data.incomingRecord, "record1", {}, 'viewer');
      setRecordTopInfo('record2', `Melinda-tietue${data.preference.recordName === 'databaseRecord' ? ' (Suositaan)' : ''}`, false);
      showRecord(data.databaseRecord, "record2", {}, 'viewer');
      setRecordTopInfo('record3', 'Yhdistetty tietue', `<li>Luontiaika: ${data.creationTime}</li>`);
      showRecord(data.mergedRecord, "record3", {}, 'viewer');
    });
  }

  if (logType === 'MATCH_LOG') {
    idbGetLogs(event.target.value).then(data => {
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
      return idbGetLogs(sequenceSelect).then(data => {
        matchSelectWrap.style.visibility = 'hidden';
        setRecordTopInfo('record1', 'Sisääntuleva tietue', false);
        showRecord(data.incomingRecord, "record1", {}, 'viewer');
        setRecordTopInfo('record2', 'Vastaava Melinda tietue', '<li>Ei löytynyt</li>');
        showRecord({}, "record2", {}, 'viewer');
      });
    }

    idbGetLogs(sequenceSelect).then(data => {
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
    idbGetLogs(event.target.value)
      .then(log =>
        log.protected === true ? (setButton('protected')) : (setButton('not protected')),
        enableElement(protectButton))
      .catch(error =>
        console.log(`Sorry, the protection status for log with sequence ${event.target.value} could not be checked: `, error));
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
      protectButton.innerHTML === 'lock_open' ? (setButton('protected')) : (setButton('not protected')))
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
  const logType = 'MERGE_LOG';

  if (id === '') {
    console.log('Nothing to remove...');
    return stopProcess();
  }

  removeLog(id, logType)
    .then(response => {
      console.log(response);
      stopProcess();
    });
}

function setDataToIndexDB(logs, sequence) {
  const select = document.querySelector(`#viewer #sequence`);
  console.log(JSON.stringify(logs));
  const keys = Object.keys(logs);

  if (keys.length === 0) {
    select.add(createOption('0', 0));
    idbSetLogs('0', {incomingRecord: {}, databaseRecord: {}, mergedRecord: {}});
    stopProcess();
    // TODO toast 404 not found
    select.value = 0;
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

function setButton(type) {
  const protectButton = document.querySelector(`#viewer #protect`);

  switch (true) {
    case (type === 'protected'):
      setButtonProperties('lock', 'This log is currently protected, click to undo protection', 'Undo protect');
      break;
    case (type === 'not protected'):
      setButtonProperties('lock_open', 'Click to protect this log', 'Protect');
      break;
    default:
      disableElement(protectButton);
  }

  function setButtonProperties(icon, infoText, tooltipText) {
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

function fetchCorrelationIdList() {
  const expanded = '1';

  startProcess();
  idbClearList();

  getCorrelationIdList(expanded)
    .then(data =>
      setCorrelationIdListDataToIndexDB(data))
    .catch((error) => {
      showPlaceholderText('Sorry, correlation id list could not be fetched');
      console.log('Error while fetching correlation id list: ', error)
      clearListView();
      stopProcess();
    });

}

function setCorrelationIdListDataToIndexDB(data) {
  idbSetList('correlationIdList', data);
  console.log('Correlation id list: ', data);
  updateOnChange(new Event('change'));
}

function updateCorrelationIdListModal() {
  clearListView();

  idbGetList('correlationIdList')
    .then((data) =>
      updateListView(data)
    )
}

function updateListView(correlationIdList) {
  const selectSorting = document.getElementById("correlationIdListSorting");
  const dateStartInputValue = document.getElementById("dateStartInput").value;
  const dateEndInputValue = document.getElementById("dateEndInput").value;

  const filteredList = filterList(correlationIdList, dateStartInputValue, dateEndInputValue);
  const sortedList = sortList(filteredList, selectSorting.value);

  if (sortedList.length === 0) {
    showPlaceholderText('No correlation ids found, please check your search filters.');
    return;
  }

  showPlaceholderText('Found ' + sortedList.length + '/' + correlationIdList.length + ' correlation ids')
  selectSorting.style.display = 'block';
  sortedList.forEach((logItem) => createListItem(logItem));
  stopProcess();

}

function clearListView() {
  const correlationIdList = document.querySelector(`#correlationIdListModal #correlationIdList`);
  correlationIdList.replaceChildren();
  const selectSorting = document.querySelector(`#correlationIdListModal #correlationIdListSorting`);
  selectSorting.style.display = 'none';
}

function filterList(correlationIdList, startDate, endDate) {
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

function createListItem(logItem) {
  const listItemDiv = createListItemDiv(logItem);
  const correlationIdList = document.querySelector(`#correlationIdListModal #correlationIdList`);
  correlationIdList.append(listItemDiv);

  function createListItemDiv({correlationId, logItemType, creationTime, logCount, cataloger}) {
    const base = document.getElementById('list-item-base');
    const listItem = base.cloneNode(true);

    listItem.id = correlationId;
    listItem.querySelector(`.list-item-id`).innerHTML = correlationId;

    const logTypeDiv = createDivWithInnerHtml(`Log type: ${logItemType}`);
    const creationTimeDiv = createDivWithInnerHtml(`Creation time: ${creationTime}`);
    const logCountDiv = createDivWithInnerHtml(`Log count: ${logCount}`);
    const catalogerDiv = createDivWithInnerHtml(`Cataloger: ${cataloger}`);

    listItem.querySelector(`.list-item-details`).append(logTypeDiv, creationTimeDiv, logCountDiv, catalogerDiv)

    listItem.addEventListener("click", function () {
      searchWithSelectedIdAndType(correlationId, logItemType);
    });

    return listItem;

    function createDivWithInnerHtml(text) {
      const divElement = document.createElement('div');
      divElement.innerHTML = text;
      return divElement;
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
}

function showPlaceholderText(text) {
  const placeholderText = document.getElementById('fetchListPlaceholderText');
  placeholderText.innerHTML = text;
}
