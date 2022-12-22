//*****************************************************************************
//
// New "Reactless" Viewer Sketch
//
//*****************************************************************************

import { setNavBar, startProcess, stopProcess } from "/common/ui-utils.js";
import { showTab, resetForms, reload } from "/common/ui-utils.js";
import { createMenuBreak, createMenuItem, createMenuSelection } from "/common/ui-utils.js";

import { Account, doLogin, logout } from "/common/auth.js"
import { transformRequest } from "/common/rest.js";
import { showRecord } from "/common/marc-record-ui.js";
import { getMatchLog, getMergeLog, getCorrelationIdList, protectLog, removeLog } from "/common/rest.js";
import { idbSet, idbGet, idbClear } from "/viewer/indexDB.js";

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
  select.setAttribute('disabled', false)

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
  const sequence = document.querySelector('#viewer #sequence').value || 0;
  const logType = document.querySelector(`#viewer #logType`).value;

  doFetch(event, id, sequence, logType);
}

window.doFetch = function (event = undefined, id = '', sequence = 0, logType = 'MERGE_LOG') {
  eventHandled(event);
  startProcess();
  idbClear();
  const sequenceSelect = document.querySelector('#viewer #sequence');
  sequenceSelect.innerHTML = '';
  sequenceSelect.setAttribute('disabled', false);
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

// Function that opens a modal 
// where user can click a correlation id from a list,
// and start a search with that correlation id.
// Correlation id list is fetched from api.
window.doOpenCorrelationIdListModal = function (event = undefined) {
  const modal = document.querySelector("#correlationIdListModal");
  modal.style.display = "flex";
  showCorrelationIdList();
}

// Function that opens the date picker
// so that the user can select starting date
// for filtering the correlation id list
window.doOpenDateStartPicker = function (event = undefined) {
  // show the datetime picker for user
  console.log('Picking start date')
  const dateStartInput = document.getElementById("dateStartInput");
  dateStartInput.showPicker();
}

// Function that opens the date picker
// so that the user can select ending date
// for filtering the correlation id list
window.doOpenDateEndPicker = function (event = undefined) {
  // show the datetime picker for user
  console.log('Picking end date')
  const dateEndInput = document.getElementById("dateEndInput");
  dateEndInput.showPicker();
}

// This function is called 
// if either start or end date input fields are changed
// and then the modal list view is updated
window.updateOnDateChange = (event) => {
  eventHandled(event);
  console.log('Start date or end date changed!')
  updateCorrelationIdListView();
}

// Closes the correlation id list modal
window.modalClose = function (event) {
  const modal = document.querySelector("#correlationIdListModal")
  modal.style.display = "none"
  const dateEndInput = document.getElementById("dateEndInput");
  return eventHandled(event);
}

// Ignore event
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
      const { record, note } = getMergeCandidateInfo(data.matchResult[event.target.value]);
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


  const id = document.querySelector(`#viewer #id`).value || '';
  const sequence = document.querySelector(`#viewer #sequence`).value || 1;

  if (id === '') {
    console.log('Nothing to protect...');
    return;
  }

  protectLog(id, sequence)
    .then(response => console.log(response));
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
    idbSet('0', { incomingRecord: {}, databaseRecord: {}, mergedRecord: {} });
    stopProcess();
    // TODO toast 404 not found
    select.value = 0;
    return select.dispatchEvent(new Event('change'));;
  }

  const refactorLogs = Object.fromEntries(keys.map(key => [logs[key].blobSequence, logs[key]]));
  const refactoredKeys = Object.keys(refactorLogs);

  select.removeAttribute('disabled');
  refactoredKeys.forEach(key => {
    idbSet(key, refactorLogs[key]);
    select.add(createOption(key, key));
  });

  if (sequence !== 0 && refactoredKeys.includes(sequence)) {
    select.value = sequence;
  }

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


//-----------------------------------------------------------------------------
// Functions for correlation id list modal 
//-----------------------------------------------------------------------------

// The list is stored here after fetching
var correlationIdList = null;

// Gets the list of correlation ids from api,
// and then shows the list in the modal,
// and also hides the placeholder text for list fetching
function showCorrelationIdList() {
  getCorrelationIdList()
    .then(list =>
      correlationIdList = list)
    .then(() =>
      updateCorrelationIdListView()
    )
    .then(() =>
      hidePlaceholderText()
    )
    .catch((error) => {
      console.log(error);
    });
}

// Filters the list by given start date and end date:
//    -If no starting or ending date is given (parameters are empty string),
//        the whole list is shown.
//    -If only startDate is given in date format and endDate is empty,
//        list is filtered to show all the ids only from startDate and forward.
//    -Giving parameter endDate in date format and parameter startDate as empty
//        filters the list to show all the ids up to the given end date (including the end date).
function filterList(startDate, endDate) {
  switch (true) {

    case (startDate !== '' && endDate !== ''):
      return correlationIdList.filter(logItem =>
        getDate(logItem) >= startDate && getDate(logItem) <= endDate);

    case (startDate !== '' && endDate === ''):
      return correlationIdList.filter(logItem =>
        getDate(logItem) >= startDate);

    case (startDate === '' && endDate !== ''):
      return correlationIdList.filter(logItem =>
        getDate(logItem) <= endDate);

    default:
      return correlationIdList;
  }
}

// Gets the log item as parameter
// and returns a substring ("yyyy-mm-dd") of the 
// "creationTime" timestamp ("yyyy-mm-ddThh:mm:ss.sssZ")
function getDate(logItem) {
  return logItem.creationTime.substring(0, 10);
}

// Compare function for array sorting.
//  -Primary sorting: correlation ids alphabetically
//  -Secondary sorting: sort log types alphabetically
// The list is first sorted alphabetically by correlation ids, 
// and if there are two identical correlation ids, 
// then the id with MERGE_LOG is listed before the same id with MATCH_LOG
function compareLogItems(logItemA, logItemB) {
  return logItemA.correlationId.localeCompare(logItemB.correlationId) || logItemB.logItemType.localeCompare(logItemA.logItemType)
}

// Updates the list view of correlation ids
// using the start date and end date.
function updateCorrelationIdListView() {
  const dateStartInputValue = document.getElementById("dateStartInput").value;
  const dateEndInputValue = document.getElementById("dateEndInput").value;

  const buttonsList = document.getElementById('correlationIdListButtons');
  buttonsList.replaceChildren();

  const filteredList = filterList(dateStartInputValue, dateEndInputValue);
  const sortedList = filteredList.sort(compareLogItems);

  sortedList.forEach((logItem) => createAndAddCorrelationIdButton(logItem.correlationId, logItem.logItemType));
}

// Hides the placeholder in modal after fetching the correlation id list
function hidePlaceholderText() {
  const placeholderText = document.getElementById('fetchListPlaceholderText');
  placeholderText.style.display = "none";
}

// Function that takes correlationId
// creates a button for it and adds it to the list
function createAndAddCorrelationIdButton(correlationId, logItemType) {
  const newCorrelationIdButton = createCorrelationIdButton(correlationId, logItemType);
  addCorrelationIdButtonToList(newCorrelationIdButton);
}

// Function that creates a correlation id button
// and returns it
function createCorrelationIdButton(correlationId, logItemType) {
  const correlationIdButton = document.createElement('button');
  correlationIdButton.innerHTML = correlationId + ' | ' + logItemType;

  if (logItemType === 'MERGE_LOG') {
    correlationIdButton.style.fontWeight = 'bold'
  }

  if (logItemType === 'MATCH_LOG') {
    correlationIdButton.style.color = 'dark gray'
  }

  correlationIdButton.addEventListener("click", function () {
    selectCorrelationIdAndTypeAndSearch(correlationId, logItemType);
  });

  return correlationIdButton;
}

// Function that sets the correlation id to input field id,
// and starts the search process and closing the modal
function selectCorrelationIdAndTypeAndSearch(correlationId, logItemType) {
  const id = document.querySelector(`#viewer #id`);
  id.value = correlationId;

  const logType = document.querySelector(`#viewer #logType`);
  logType.value = logItemType;

  doSearchPress();
  modalClose();
}

// Function that adds correlation id button to the list element in the modal
function addCorrelationIdButtonToList(correlationIdButton) {
  const buttonsList = document.getElementById('correlationIdListButtons');
  buttonsList.append(correlationIdButton);
}