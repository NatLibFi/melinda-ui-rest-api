//*****************************************************************************
//
// New "Reactless" Viewer Sketch
//
//*****************************************************************************

import {showTab, setNavBar, startProcess, stopProcess, showSnackbar} from "/common/ui-utils.js";
import {Account, doLogin, logout} from "/common/auth.js"
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
    addModalEventListeners();
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
}

//-----------------------------------------------------------------------------

window.onAccount = function (e) {
  console.log('Account:', e);
  logout();
}

//-----------------------------------------------------------------------------
// Do button actions
//-----------------------------------------------------------------------------

const oneDayInMs = (1 * 24 * 60 * 60 * 1000);

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
  const idInputField = document.querySelector(`#viewer #id`);
  console.log('Fetching...');

  if (id === '') {
    showSnackbar({text: 'Lisää ID haun aloittamista varten', closeButton: 'true'});
    highlightElement(idInputField);
    console.log('Nothing to fetch...');
    return stopProcess();
  }

  if (logType === 'MERGE_LOG') {
    col3.style.display = 'block';
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
  const protectButton = document.querySelector(`#viewer #protect`);
  const removeButton = document.querySelector(`#viewer #delete`);
  const clearButton = document.querySelector(`#viewer #clearLogs`);
  const sequenceInputField = document.querySelector(`#viewer #sequenceInput`);
  const sequenceSelect = document.querySelector(`#viewer #sequence`);

  const matchSelectWrap = document.querySelector('.col .header .Select');
  matchSelectWrap.style.visibility = 'hidden';

  const matchSelect = document.querySelector('.col .header #match');
  matchSelect.innerHTML = '';

  if (logType === 'EMPTY_LOG') {
    console.log('Clearing record view');

    const idInputField = document.querySelector(`#viewer #id`);
    const logTypeSelect = document.querySelector(`#viewer #logType`);
    const col3 = document.querySelector('#viewer #record3').parentElement;

    idInputField.value = '';
    logTypeSelect.value = 'MERGE_LOG';
    sequenceInputField.value = '';
    sequenceSelect.value = '';

    col3.style.display = 'block';
    sequenceInputField.style.display = 'block';
    sequenceSelect.style.display = 'none';

    disableElement(protectButton);
    disableElement(removeButton);
    disableElement(clearButton)

    setRecordTopInfo('record1', `Sisääntuleva tietue`);
    showRecord({}, "record1", {}, 'viewer');
    setRecordTopInfo('record2', `Melinda-tietue`);
    showRecord({}, "record2", {}, 'viewer');
    setRecordTopInfo('record3', 'Yhdistetty tietue');
    showRecord({}, "record3", {}, 'viewer');
    return;
  }

  checkLogProtection();
  disableElement(removeButton);
  enableElement(clearButton);
  sequenceInputField.style.display = 'none';
  sequenceSelect.style.display = 'block';

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
        log.protected === true ? (setProtectButton('protected'), toggleRemoveButtonByLogAge(log.creationTime)) : setProtectButton('not protected'),
        enableElement(protectButton))
      .catch(error =>
        console.log(`Sorry, the protection status for log with sequence ${event.target.value} could not be checked: `, error));

    function toggleRemoveButtonByLogAge(logCreationTime) {
      const isOverWeekOld = Date.parse(logCreationTime) < (Date.now() - (7 * oneDayInMs))
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

  let link = window.location;

  if (id !== '' && sequence !== '') {
    link = `${window.location}?id=${id}&logType=${logType}&sequence=${sequence}`
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
        ? (setProtectButton('protected'), showSnackbar({text: `Turvattu ID:n sekvenssi ${sequence}`}))
        : (setProtectButton('not protected'), showSnackbar({text: `Turvaus poistettu ID:n sekvenssistä ${sequence}`, closeButton: 'true'}))
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

window.cancelRemove = function (event) {
  console.log('Nothing removed');
  showSnackbar({text: 'Toiminto peruttu!', closeButton: 'true'});
}

window.confirmRemove = function (event = undefined) {
  console.log('Removing...');
  startProcess();
  remove(event);
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

function remove(event = undefined) {
  const force = '1';
  const id = document.querySelector(`#viewer #id`).value || '';

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

  const sequenceInputField = document.getElementById("sequenceInput");

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

function enableElement(element) {
  element.removeAttribute('disabled');
}

function disableElement(element) {
  element.disabled = true;
}

function highlightElement(element) {
  element.classList.add('highlight');

  setTimeout(() => {
    element.classList.remove('highlight');
  }, 5000);
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
  const modal = document.querySelector("#correlationIdListModal")
  modal.style.display = "none"
  return eventHandled(event);
}

window.toggleShowMergeLogs = function (event = undefined) {
  eventHandled(event);
  const toggleMergeLogsButton = document.getElementById('mergeLogsSelect');
  toggleFilterButton(toggleMergeLogsButton);
  updateOnChange(new Event('change'));
}

window.toggleShowMatchLogs = function (event = undefined) {
  eventHandled(event);
  const toggleMatchLogsButton = document.getElementById('matchLogsSelect');
  toggleFilterButton(toggleMatchLogsButton);
  updateOnChange(new Event('change'));
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

window.clearFilters = function ({event = undefined, clearLogFilters = 'true', clearDateFilters = 'true', clearInputFilters = 'true'}) {
  eventHandled(event);
  resetDateFilteringButtons();

  if (clearLogFilters === 'false' && clearDateFilters === 'true' && clearInputFilters === 'false') {
    return;
  }

  resetFilteringInputs();
  resetLogFilteringButtons();
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

  function resetLogFilteringButtons() {
    const matchLogsSelect = document.querySelector(`#correlationIdListModal #matchLogsSelect`)
    const mergeLogsSelect = document.querySelector(`#correlationIdListModal #mergeLogsSelect`)
    const listDetailsSelect = document.querySelector(`#correlationIdListModal #toggleListDetails`);


    selectFilteringButtons(matchLogsSelect, mergeLogsSelect, listDetailsSelect);
    setDefaultTitles(matchLogsSelect, mergeLogsSelect, listDetailsSelect);
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
    clearFilters({clearLogFilters: 'false', clearDateFilters: 'true', clearInputFilters: 'false'});
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
    .then(data =>
      setCorrelationIdListDataToIndexDB(data))
    .catch((error) => {
      setOrClearErrorMessageAndStyle({set: 'true', text: 'Valitettavasti listaa ei pystytty juuri nyt hakemaan'});
      console.log('Error while fetching correlation id list: ', error);
      stopProcess();
    });
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
    .then((data) =>
      updateListView(data)
    )
}

function updateListView(correlationIdList) {
  const updatedList = filterAndSortCorrelationIdList();
  showlastSearchedCorrelationId();
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

  function filterAndSortCorrelationIdList(filterByLogTypes = true, filterByDates = true, filterBySearchString = true, sortBySelected = true) {
    const showMergeLogsValue = document.querySelector(`#correlationIdListModal #mergeLogsSelect`).dataset.value;
    const showMatchLogsValue = document.querySelector(`#correlationIdListModal #matchLogsSelect`).dataset.value;
    const dateStartInputValue = document.getElementById(`dateStartInput`).value;
    const dateEndInputValue = document.getElementById(`dateEndInput`).value;
    const correlationIdInputValue = document.getElementById(`correlationIdInput`).value;
    const selectSortingValue = document.getElementById(`correlationIdListSorting`).value;

    let updatedList = correlationIdList;

    switch (true) {
      case (filterByLogTypes === true):
        updatedList = filterListWithLogTypes(updatedList, showMergeLogsValue, showMatchLogsValue);
      case (filterByDates === true):
        updatedList = filterListWithDates(updatedList, dateStartInputValue, dateEndInputValue);
      case (filterBySearchString === true):
        updatedList = filterListWithSearchString(updatedList, correlationIdInputValue);
      case (sortBySelected === true):
        updatedList = sortList(updatedList, selectSortingValue);
      default:
        return updatedList;
    }

    function filterListWithLogTypes(list, showMergeLogs, showMatchLogs) {
      switch (true) {
        case (showMergeLogs === 'true' && showMatchLogs === 'false'):
          return list.filter(logItem => logItem.logItemType !== 'MATCH_LOG');
        case (showMergeLogs === 'false' && showMatchLogs === 'true'):
          return list.filter(logItem => logItem.logItemType !== 'MERGE_LOG');
        case (showMergeLogs === 'false' && showMergeLogs === 'false'):
          return list.filter(logItem => logItem.logItemType !== 'MERGE_LOG' && logItem.logItemType !== 'MATCH_LOG');
        default:
          return list;
      }
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

  function showlastSearchedCorrelationId() {
    const lastSearchedCorrelationId = document.getElementById(`id`).value;
    const infoTextDiv = document.getElementById(`lastSearchedInfoText`);
    const lastSearchedListItem = document.getElementById(lastSearchedCorrelationId);

    if (lastSearchedCorrelationId === '') {
      return;
    }

    if (!lastSearchedListItem) {
      infoTextDiv.innerHTML = (`Edellinen haku: <span class="correlation-id-font"> ${lastSearchedCorrelationId}</span`);
      infoTextDiv.title = '';
      return;
    }

  }

  function showSearchResultsInfo(found, total) {
    const styledResult = `<span class="styled-result">&nbsp;${found}&nbsp;</span>`
    showPlaceholderText(`Näytetään ${styledResult}/${total} ID:tä`)
  }

  function showListSortingOptions() {
    const selectSorting = document.getElementById(`correlationIdListSorting`);
    selectSorting.style.visibility = 'visible';
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
        infoIcon.innerHTML = "lock_clock";
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
        id.value = correlationId;

        const logType = document.querySelector(`#viewer #logType`);
        logType.value = logItemType;

        doSearchPress();
        modalClose();
      }


    }
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
      const lastSearchedCorrelationId = document.getElementById(`id`).value;
      const lastSearchedLogType = document.getElementById(`logType`).value;
      const id = lastSearchedCorrelationId + ':' + lastSearchedLogType;
      const lastSearchedListItem = document.getElementById(id);

      if (lastSearchedCorrelationId === '' || !lastSearchedListItem) {
        return;
      }

      lastSearchedListItem.classList.add('last-searched')

      addSelectedIcon();
      updateSearchIcon();
      addLinkToListItem();

      function addSelectedIcon() {
        const selectedIcon = document.createElement('span');
        selectedIcon.classList.add('material-icons', 'selected-list-item-check-icon');
        selectedIcon.innerHTML = "check";
        lastSearchedListItem.querySelector(`.list-item-icons`).append(selectedIcon);
      }

      function updateSearchIcon() {
        const searchIcon = document.querySelector(`.last-searched .list-item-icons-search`);
        searchIcon.innerHTML = 'find_replace';
        searchIcon.title = "Hae uudelleen tällä ID:llä";
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
