//*****************************************************************************
//
// New "Reactless" Muuntaja Sketch
//
//*****************************************************************************

import {
  startProcess, stopProcess,
  showTab, resetForms, reload, showNotification, showServerNotifications,
  createDropdownItem, createSelectItem,
  createSelectOption
} from '/common/ui-utils.js';

import {Account, doLogin, logout} from '/common/auth.js';
import {profileRequest, transformRequest} from '/common/rest.js';
import {showRecord, editField} from '/common/marc-record-ui.js';


//-----------------------------------------------------------------------------
// on page load:
//-----------------------------------------------------------------------------

window.initialize = function () {
  console.log('Initializing');

  showServerNotifications({clientName: 'muuntaja', onSuccess: ()=>{doLogin(authSuccess);}});

  function authSuccess(user) {

    profileRequest()
      .then(profiles => {
        setProfiles(profiles);
        const accountMenu = document.getElementById('accountMenu');
        accountMenu.classList.add('show');
        const username = document.querySelector('#accountMenu #username');
        username.innerHTML = Account.get().Name;
        showTab('muuntaja');
        parseUrlParameters();
        doTransform();
      });
  }
  function parseUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const sourceId = urlParams.get('sourceId') || '';
    const baseId = urlParams.get('baseId') || '';
    const type = urlParams.get('type') || 'p2e';
    const profile = urlParams.get('profile') || 'KVP';

    document.querySelector('.record-merge-panel #source #ID').defaultValue = sourceId;
    document.querySelector('.record-merge-panel #base #ID').defaultValue = baseId;
    document.querySelector('#type-options [name=\'type\']').value = type;
    transformed.options.type = type;
    document.querySelector('#profile-options [name=\'profile\']').value = profile;
    transformed.options.profile = profile;
  }

  document.querySelector('.record-merge-panel #source #ID').addEventListener('input', onMergePanelInputChange);
  document.querySelector('.record-merge-panel #base #ID').addEventListener('input', onMergePanelInputChange);

  function onMergePanelInputChange(e){
    updateUrlParameters(e);
    updateRecordSwapButtonState();
  }

  function updateUrlParameters(e) {
    const isOnPath = (id) => e.composedPath().some(element => element.id === id);
    const removeIfEmpty = (id) => {
      if (e.target.value === '') {
        urlParams.delete(id);
      }
    };
    const urlParams = new URLSearchParams(window.location.search);

    if (isOnPath('source') && isOnPath('ID')) {
      urlParams.set('sourceId', e.target.value);
      removeIfEmpty('sourceId');
    }

    if (isOnPath('base') && isOnPath('ID')) {
      urlParams.set('baseId', e.target.value);
      removeIfEmpty('baseId');
    }

    window.history.replaceState({}, '', decodeURIComponent(`${window.location.pathname}?${urlParams}`));

    if (window.location.search === '') {
      window.history.replaceState({}, '', '/muuntaja/');
    }
  }

  
};

function updateRecordSwapButtonState(){
  const sourceID = document.querySelector(`#muuntaja .record-merge-panel #source #ID`).value;
  const baseID = document.querySelector(`#muuntaja .record-merge-panel #base #ID`).value;

  document.getElementById('swap-button').disabled = !sourceID || !baseID;
};


//-----------------------------------------------------------------------------

function setProfiles(options) {
  console.log('Profiles:', options);
  transformed.options = options.defaults;

  const typeOptions = document.querySelector('#type-options');
  typeOptions.innerHTML = '';

  const typeDropdown = createDropdownItem('', ['Select', 'VBox'], 'Muunnostyyppi');
  const typeSelect = createSelectItem('type');
  typeSelect.addEventListener('change', (event) => setTransformType(event, event.target.value));

  typeOptions.appendChild(typeDropdown);
  typeDropdown.appendChild(typeSelect);

  for (const type in options.type) {
    typeSelect.appendChild(createSelectOption(type, options.type[type]));
  }

  const profileOptions = document.querySelector('#profile-options');
  profileOptions.innerHTML = '';

  const profileDropdown = createDropdownItem('', ['Select', 'VBox'], 'Muunnosprofiili');
  const profileSelect = createSelectItem('profile');
  profileSelect.addEventListener('change', (event) => setTransformProfile(event, event.target.value));

  profileOptions.appendChild(profileDropdown);
  profileDropdown.appendChild(profileSelect);

  for (const profile in options.profile) {
    profileSelect.appendChild(createSelectOption(profile, options.profile[profile]));
  }
}

function setTransformType(event, value) {
  console.log('Type:', value);
  transformed.options.type = value;
  delete transformed.base.record;
  doTransform();
  return eventHandled(event);
}

function setTransformProfile(event, value) {
  console.log('Profile:', value);
  transformed.options.profile = value;
  delete transformed.base.record;
  doTransform();
  return eventHandled(event);
}

//-----------------------------------------------------------------------------

window.onNew = function (e) {
  console.log('New:', e);
  resetForms(document.getElementById('muuntaja'));
  return eventHandled(e);
};

window.onEdit = function (e) {
  console.log('Edit:', e);
  editmode = !editmode;
  if (editmode) {
    e.target.classList.add('edit-mode');
  } else {
    e.target.classList.remove('edit-mode');
  }
  styleBasedOnEditState();
  showTransformed(null);
  return eventHandled(e);

  function styleBasedOnEditState(){
    const originalStyle = getComputedStyle(document.querySelector('.record-merge-panel'));
    const borderStyleActive = "solid";
    const borderColorActive = originalStyle.getPropertyValue('--color-melinda-green-custom');

    //use .record-merge-panel #source/#base/#result #some-sub-id/.some-sub-class
    const resultPanel = document.querySelector('.record-merge-panel #result ');

    if(editmode){
      resultPanel.style.borderStyle = borderStyleActive;
      resultPanel.style.borderColor = borderColorActive;
      resultPanel.style.borderWidth = "2px";
    }
    else{
      resultPanel.style.borderStyle = "initial";
    }
  }
};

window.onNewField = function (e) {
  editField({
    tag: '', ind1: '', ind2: '',
    subfields: []
  });
  return eventHandled(e);
};

window.onNewInstance = function(e){

  const sourceInput = document.querySelector(`#muuntaja .record-merge-panel #source #ID`);
  const baseInput = document.querySelector(`#muuntaja .record-merge-panel #base #ID`);

  //clear inputs
  sourceInput.value = '';
  baseInput.value = '';

  //trigger input event listener to update required values (ie. url parameters)
  sourceInput.dispatchEvent(new Event('input'));
  baseInput.dispatchEvent(new Event('input'));

  //set content
  doTransform();
};

window.onSearch = function (e) {
  console.log('Search:', e);
  //const dialog = document.getElementById('searchDlg');
  //console.log('Dialog:', dialog);
  //dialog.show();
};

window.onSave = function (e) {
  console.log('Save:', e);
  return eventHandled(e);
};

window.onRecordSwap = function(e){

  const sourceInput = document.querySelector(`#muuntaja .record-merge-panel #source #ID`);
  const baseInput = document.querySelector(`#muuntaja .record-merge-panel #base #ID`);

  console.log('Swap:ing between source and base');

  //swap id:s
  const originalSourceId = sourceInput.value;
  const originalBaseId = baseInput.value;

  sourceInput.value = originalBaseId;
  baseInput.value = originalSourceId;

  //trigger input event listener to update required values (ie. url parameters)
  sourceInput.dispatchEvent(new Event('input'));
  baseInput.dispatchEvent(new Event('input'));

  //swap records around
  if(transformed){
    const sourceData = transformed.source;
    const baseData = transformed.base;

    transformed.source = baseData;
    transformed.base = sourceData;

    doTransform();
  }

  return eventHandled(e);
};

window.onSettings = function (e) {
  console.log('Settings:', e);
  return eventHandled(e);
};

window.onAccount = function (e) {
  console.log('Account:', e);
  logout();
};

window.copyLink = function (e) {
  eventHandled(e);

  const type = document.querySelector('#type-options [name=\'type\']').value;
  const profile = document.querySelector('#profile-options [name=\'profile\']').value;
  let leadingChar = '';

  if (window.location.href.includes('?')) {
    if (window.location.search !== '') {
      leadingChar = '&';
    }
  } else {
    leadingChar = '?';
  }

  navigator.clipboard.writeText(`${window.location}${leadingChar}type=${type}&profile=${profile}`);

  showNotification({componentStyle: 'banner', style: 'success', text: 'Linkki kopioitu!'});
};

//-----------------------------------------------------------------------------
// info needed for muuntaja merge REST call:
// - Base record
// - Transform options
// - Source record
// - Field selections
// - User edits
//-----------------------------------------------------------------------------

var transformed = {
  options: {},
  source: null,
  base: null,
  exclude: {},
  replace: {},
  include: []
};

const keys = {
  source: 'source',
  base: 'base',
  result: 'result'
};

window.editmode = false;

//-----------------------------------------------------------------------------
// Do transform
//-----------------------------------------------------------------------------

window.doTransform = function (event = undefined) {
  console.log('Transforming');
  if (event) {
    event.preventDefault();
  }

  //console.log('Source ID:', sourceID);
  //console.log('Base ID:', baseID);
  console.log('Transforming:', transformed);

  const sourceID = document.querySelector(`#muuntaja .record-merge-panel #source #ID`).value;
  const baseID = document.querySelector(`#muuntaja .record-merge-panel #base #ID`).value;

  //exception, if source and base ids are the same inform user, ignore empty searches
  if(sourceID && baseID && sourceID === baseID){
    console.log('Source and base ID:s match. This is not permitted');
    alert('Lähde ja Pohja tietueet eivät voi olla samat');
    return;
  }

  if (!transformed.source || sourceID != transformed.source.ID) {
    transformed.source = {ID: sourceID};
  }

  if (!transformed.base || baseID != transformed.base.ID) {
    transformed.base = {ID: baseID};
  }

  startProcess();

  transformRequest(transformed)
    .then(response => response.json())
    .then(records => {
      stopProcess();
      console.log('Transformed:', records);
      updateRecordSwapButtonState();
      showTransformed(records);
    });
};

//-----------------------------------------------------------------------------
// Field view decorator
//-----------------------------------------------------------------------------

function onEditClick(event, field, original){
  const {id} = field;
  console.log(`Edit Click on ${id}`);
  
  //returns sub element of the field clicked, if no specific subelement it returns just row row-fromBase
  //span uses as class classname/id
  var subElement = null;
  try {
    subElement = {};
    subElement.class = event.originalTarget.attributes.class.nodeValue;
    subElement.index = parseInt(event.originalTarget.attributes.index.nodeValue);
  } catch (error) {
    console.log(`Getting field sub element encountered error: ${error}.`);
    console.log('Or maybe user clicked on some parent element without required attributes. Skipping preactivation for a spesific value.');
    subElement = null;
  }
  //make sure only certain values can be auto edit focus requested
  //if not correct later expects null and does nothing
  if(subElement && !isSubElementAcceptable(subElement.class)){
      console.log(`Fields sub element ${subElement.class} is not acceptable for pre activation`);
      subElement = null;
  }

  editField(field, original, subElement);
  
  return eventHandled(event);

  function isSubElementAcceptable(elementRequested){
    switch (elementRequested){
      case 'tag':
      case 'ind1':
      case 'ind2':
      case 'code':
      case 'value':
        return true;
      default:
        return false;
    }
  }
}
function onToggleClick(event, field){
  const {id} = field;
  console.log(`Toggle Click on ${id}`);

    if (!transformed.exclude[id]) {
      transformed.exclude[id] = true;
    } else {
      delete transformed.exclude[id];
    }

    doTransform();
}

window.editSaveField = function (field) {
  console.log('Saving field:', field);

  if (field.id) {
    transformed.replace[field.id] = field;
  } else {
    transformed.include.push(field);
  }
  doTransform();
};

window.editUseOriginal = function (field) {
  delete transformed.replace[field.id];
  doTransform();
};

//-----------------------------------------------------------------------------
// Show transformation results
//-----------------------------------------------------------------------------

function showTransformed(update = undefined) {
  //updateTransformed(update);
  if (update) {
    transformed = update;
  }

  if (update?.source?.status == 404) {
    notFoundDlgOpen('Lähde');
  }

  if (update?.base?.status == 404) {
    notFoundDlgOpen('Pohja');
    // alert("Tietuetta ei löytynyt annetulla hakuehdolla");
  }

  const {source, base, result} = transformed;

  // Get field source for decorator
  const sourceFields = getFields(source);
  const baseFields = getFields(base);
  const resultFields = getFields(result);

  const resultIDs = resultFields.map(f => f.id);
  const includedSourceIDs = sourceFields.map(f => f.id).filter(id => resultIDs.includes(id));
  const includedBaseIDs = baseFields.map(f => f.id).filter(id => resultIDs.includes(id));

  const from = {
    ...includedSourceIDs.reduce((a, id) => ({...a, [id]: keys.source}), {}),
    ...includedBaseIDs.reduce((a, id) => ({...a, [id]: keys.base}), {})
  };

  const original = getLookup(sourceFields.concat(baseFields));

  //console.log(transformed.from)

  // Show records
  showRecord(source, keys.source, {
    onClick: onToggleClick,
    from,
    exclude: transformed.exclude
  });
  showRecord(base, keys.base, {
    onClick: onToggleClick,
    from,
    exclude: transformed.exclude
  });
  showRecord(result, keys.result, {
    onClick: editmode ? onEditClick : onToggleClick,
    onDelete: onToggleClick,
    from,
    original,
    exclude: transformed.exclude,
    replace: transformed.replace
  });

  function getFields(record) {
    return record?.fields ?? [];
  }

  function getLookup(fields) {
    return fields.reduce((a, field) => ({...a, [field.id]: field}), {});
  }
}

function notFoundDlgOpen(recordType) {
  const dlg = document.querySelector('#notFoundDlg');
  dlg.style.display = 'flex';
  const prefix = document.querySelector('#notFoundDlg #recordType');
  prefix.innerHTML = recordType;
}

window.notFoundDlgClose = function (event) {
  const dlg = document.querySelector('#notFoundDlg');
  dlg.style.display = 'none';
  return eventHandled(event);
};

window.jsonDlgOpen = function (event) {
  const dlg = document.querySelector('#jsonDlg');
  dlg.style.display = 'flex';
  const content = document.querySelector('#jsonDlg #jsonContent');
  content.innerHTML = '';
  content.appendChild(createJsonInput('recordAsJson', 'recordAsJson', JSON.stringify(transformed, null, 1)));
};

window.jsonDlgClose = function (event) {
  const dlg = document.querySelector('#jsonDlg');
  dlg.style.display = 'none';
  return eventHandled(event);
};

function createJsonInput(id, className, content, editable = true) {
  const input = document.createElement('pre');
  input.setAttribute('id', id);
  input.classList.add(className);
  if (editable) {
    input.classList.add('editable');
  }
  input.textContent = content;
  input.contentEditable = editable;
  return input;
}

window.selectJson = function (event) {
  const record = document.querySelector('#recordAsJson');
  if (document.body.createTextRange) {
    var range = document.body.createTextRange();
    range.moveToElementText(record);
    range.select();
  } else if (window.getSelection) {
    const selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(record);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

window.saveJson = function (event) {
  const record = document.querySelector('#recordAsJson');
  transformed = JSON.parse(record.textContent);
  doTransform();
  document.querySelector('#type-options [name=\'type\']').value = transformed.options.type;
  document.querySelector('#profile-options [name=\'profile\']').value = transformed.options.profile;
  jsonDlgClose(event);
};

function getDeepCopyOfObject(obj){
  return JSON.parse(JSON.stringify(obj));
}