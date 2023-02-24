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
  const scrollToTopButton = document.querySelector(`#correlationIdListModal #scrollToTopButton`);

  modal.style.display = 'flex';

  dateStartInput.addEventListener('click', event => {event.stopPropagation();}, false);
  dateEndInput.addEventListener('click', event => {event.stopPropagation();}, false);

  modal.addEventListener('scroll', event => {
    eventHandled(event);
    scrollToTopButton.style.display = (modal.scrollTop > 100 ? 'block' : 'none');
  });

  fetchCorrelationIdList();
}

window.updateOnChange = (event) => {
  eventHandled(event);
  updateCorrelationIdListModal();
}

window.ignore = function (event) {
  return eventHandled(event);
}

window.toggleShowMergeLogs = function (event = undefined) {
  eventHandled(event);
  const mergeLogsSelect = document.querySelector(`#correlationIdListModal #mergeLogsSelect`)
  mergeLogsSelect.value = (mergeLogsSelect.value === 'true' ? false : true);
  mergeLogsSelect.value === 'true' ? mergeLogsSelect.classList.add('filtering-button-selected') : mergeLogsSelect.classList.remove('filtering-button-selected');
  updateOnChange(new Event('change'));
}

window.toggleShowMatchLogs = function (event = undefined) {
  eventHandled(event);
  const matchLogsSelect = document.querySelector(`#correlationIdListModal #matchLogsSelect`)
  matchLogsSelect.value = (matchLogsSelect.value === 'true' ? false : true);
  matchLogsSelect.value === 'true' ? matchLogsSelect.classList.add('filtering-button-selected') : matchLogsSelect.classList.remove('filtering-button-selected');
  updateOnChange(new Event('change'));
}

window.toggleListDetails = function (event = undefined) {
  eventHandled(event);
  const listDetailsSelect = document.querySelector(`#correlationIdListModal #toggleListDetails`);
  listDetailsSelect.value = (listDetailsSelect.value === 'true' ? false : true);
  listDetailsSelect.value === 'true' ? listDetailsSelect.classList.add('filtering-button-selected') : listDetailsSelect.classList.remove('filtering-button-selected');
  updateOnChange(new Event('change'));
}

window.toggleOldLogs = function (event = undefined) {
  eventHandled(event);
  const oldLogsSelect = document.querySelector(`#correlationIdListModal #toggleOldLogs`);
  oldLogsSelect.value = (oldLogsSelect.value === 'true' ? false : true);
  oldLogsSelect.value === 'true' ? oldLogsSelect.classList.add('filtering-button-selected') : oldLogsSelect.classList.remove('filtering-button-selected');
  updateOnChange(new Event('change'));
}

window.clearFilters = function (event = undefined) {
  const dateStartInput = document.querySelector(`#correlationIdListModal #dateStartInput`);
  const dateEndInput = document.querySelector(`#correlationIdListModal #dateEndInput`);
  const correlationIdInput = document.getElementById(`correlationIdInput`);

  dateStartInput.value = '';
  dateEndInput.value = '';
  correlationIdInput.value = '';

  const oldLogsSelect = document.querySelector(`#correlationIdListModal #toggleOldLogs`);
  const matchLogsSelect = document.querySelector(`#correlationIdListModal #matchLogsSelect`)
  const mergeLogsSelect = document.querySelector(`#correlationIdListModal #mergeLogsSelect`)
  const listDetailsSelect = document.querySelector(`#correlationIdListModal #toggleListDetails`);
  unselectFilteringButtons(oldLogsSelect);
  selectFilteringButtons(matchLogsSelect, mergeLogsSelect, listDetailsSelect);

  console.log('All clear!')
  updateOnChange(event);
}

// Helper function to unselect buttons (set the value and style of unselected button)
function unselectFilteringButtons(...buttons) {
  buttons.forEach(button => (button.value = 'false', button.classList.remove('filtering-button-selected')));
}

// Helper function to select buttons (set the value and style of selected button)
function selectFilteringButtons(...buttons) {
  buttons.forEach(button => (button.value = 'true', button.classList.add('filtering-button-selected')));
} 

window.goToTop = function (event = undefined) {
  eventHandled(event);
  const modal = document.querySelector(`#correlationIdListModal`);
  modal.scrollTo({top: 0, behavior: 'smooth'})
}

window.modalClose = function (event) {
  const modal = document.querySelector("#correlationIdListModal")
  modal.style.display = "none"
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
  const selectSorting = document.getElementById(`correlationIdListSorting`);
  const dateStartInputValue = document.getElementById(`dateStartInput`).value;
  const dateEndInputValue = document.getElementById(`dateEndInput`).value;
  const correlationIdInputValue = document.getElementById(`correlationIdInput`).value;
  const lastSearchedCorrelationId = document.getElementById(`id`).value;
  const lastSearchedInfoTextDiv = document.getElementById(`lastSearchedInfoText`);
  const showMergeLogsValue = document.querySelector(`#correlationIdListModal #mergeLogsSelect`).value;
  const showMatchLogsValue = document.querySelector(`#correlationIdListModal #matchLogsSelect`).value;
  const showListDetailsValue = document.querySelector(`#correlationIdListModal #toggleListDetails`).value;
  const showOldLogsValue = document.querySelector(`#correlationIdListModal #toggleOldLogs`).value;

  const filteredListByLogTypes = filterListByLogTypes(correlationIdList, showMergeLogsValue, showMatchLogsValue);
  const filteredListByDates = filterListWithDates(filteredListByLogTypes, dateStartInputValue, dateEndInputValue);
  const filteredListByAge = filterListWithLogAge(filteredListByDates, showOldLogsValue, 7.5);
  const filteredListBySearchString = filterListWithSearchString(filteredListByAge, correlationIdInputValue);
  const sortedList = sortList(filteredListBySearchString, selectSorting.value);

  if (sortedList.length === 0) {
    showPlaceholderText('No correlation ids found, please check your search filters.');
    return;
  }

  if (lastSearchedCorrelationId !== '') {
    lastSearchedInfoTextDiv.innerHTML = (`Last searched correlation id: ${lastSearchedCorrelationId}`)
  };

  showPlaceholderText(`Found <span style="font-weight: bold">&nbsp;${sortedList.length}&nbsp;</span> /${correlationIdList.length} correlation ids`)
  selectSorting.style.display = 'block';

  sortedList.forEach((logItem) => createListItem(logItem));

  const listDetailsDivs = document.querySelectorAll(`#correlationIdListModal #correlationIdList .list-item-details`);
  listDetailsDivs.forEach(div => showListDetailsValue === 'true' ? div.style.display = 'flex' : div.style.display = 'none');

  stopProcess();
}

function clearListView() {
  const correlationIdList = document.querySelector(`#correlationIdListModal #correlationIdList`);
  const selectSorting = document.querySelector(`#correlationIdListModal #correlationIdListSorting`);
  const dateStartInput = document.getElementById(`dateStartInput`);
  const dateEndInput = document.getElementById(`dateEndInput`);

  correlationIdList.replaceChildren();
  selectSorting.style.display = 'none';

  if (dateStartInput.value === '') {
    dateStartInput.setAttribute('type', 'text')
    dateStartInput.placeholder = 'Start Date'
  }

  if (dateEndInput.value === '') {
    dateEndInput.setAttribute('type', 'text')
    dateEndInput.placeholder = 'End date'
  }
}

function filterListWithLogAge(correlationIdList, showOldLogsValue, ageInDays) {
  return showOldLogsValue === 'true' ? correlationIdList.filter(logItem => Date.parse(logItem.creationTime) < (Date.now() - (ageInDays * 24 * 60 * 60 * 1000))) : correlationIdList;
}

function filterListByLogTypes(correlationIdList, showMergeLogs, showMatchLogs) {
  switch (true) {
    case (showMergeLogs === 'true' && showMatchLogs === 'false'):
      return correlationIdList.filter(logItem => logItem.logItemType !== 'MATCH_LOG');
    case (showMergeLogs === 'false' && showMatchLogs === 'true'):
      return correlationIdList.filter(logItem => logItem.logItemType !== 'MERGE_LOG');
    case (showMergeLogs === 'false' && showMergeLogs === 'false'):
      return correlationIdList.filter(logItem => logItem.logItemType !== 'MERGE_LOG' && logItem.logItemType !== 'MATCH_LOG');
    default:
      return correlationIdList;
  }
}

function filterListWithSearchString(correlationIdList, searchString) {
  return correlationIdList.filter(logItem => logItem.correlationId.includes(searchString));
}

function filterListWithDates(correlationIdList, startDate, endDate) {
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

  function createListItemDiv({correlationId, logItemType, creationTime, logCount}) {
    const base = document.getElementById('list-item-base');
    const listItem = base.cloneNode(true);

    listItem.id = correlationId;
    listItem.querySelector(`.list-item-id`).innerHTML = correlationId;

    const logTypeDiv = createDivWithInnerHtml(`Log type: <span style="font-weight: bold">${logItemType}</span>`);
    const creationTimeDiv = createDivWithInnerHtml(`Creation time: <span style="font-weight: bold">${creationTime.substring(0, 10)} ${creationTime.substring(11, 22)}</span>`);
    const logCountDiv = createDivWithInnerHtml(`Log count: <span style="font-weight: bold">${logCount}</span>`);

    listItem.querySelector(`.list-item-details`).append(logTypeDiv, creationTimeDiv, logCountDiv);

    listItem.addEventListener('click', () => {
      searchWithSelectedIdAndType(correlationId, logItemType);
    });

    const overWeekOld = Date.parse(logItem.creationTime) < Date.now() - (7.5 * 24 * 60 * 60 * 1000)

    if (overWeekOld) {
      const infoIcon = document.createElement('span');
      infoIcon.classList.add('material-icons');
      infoIcon.innerHTML = "info";
      infoIcon.title = ('This correlation id is over week old');
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
