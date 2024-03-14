//*****************************************************************************
//
// MARC field editor
//
//*****************************************************************************

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

let onDeleteField = null;

export function showRecord(record, dest, decorator = {}, recordDivName = 'muuntaja', logRecord = true) {

  if (logRecord) {
    console.log('Show Record:', record);
  }

  const {replace, onDelete} = decorator;
  onDeleteField = onDelete;

  // Get div to fill in the fields
  const recordDiv = document.querySelector(`#${recordDivName} .record-merge-panel #${dest} #Record`);
  recordDiv.innerHTML = '';

  if (!record) {
    return;
  }

  if (record.error) {
    const error = document.createElement('div');
    error.classList.add('error');
    error.textContent = getHumanReadableErrorMessage(record.error);
    console.error(record.error);
    recordDiv.appendChild(error);
  }

  if (record.notes) {
    const notes = document.createElement('div');
    notes.classList.add('notes');
    notes.textContent = record.notes;
    recordDiv.appendChild(notes);
  }

  if (record.leader) {
    addField(recordDiv, {tag: 'LDR', value: record.leader}, null, dest);
  }

  if (record.fields) {
    for (const field of record.fields) {
      const content = getContent(field);
      addField(recordDiv, content, decorator, dest);
    }
  }

  function getHumanReadableErrorMessage(errorMessage){
    var humanReadableError = 'Tapahtui virhe';
    if(errorMessage.includes('Record is invalid')){
      humanReadableError = 'Tietueen validointi ei onnistunut. Tarkistathan merkatut kentät.';
    }
    return humanReadableError;
  }
  function getContent(field) {
    return (replace && replace[field.id]) ?? field;
  }

}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

function addField(div, field, decorator = null, recordDestination = '') {
  //console.log(field)
  const row = document.createElement('div');
  row.setAttribute('recordDestination', recordDestination);

  row.classList.add('row');

  const {from, original, replace, exclude, insert, onClick} = decorator ?? {};
  decorateField(row, field);

  if (onClick && field.id) {
    row.classList.add('clickable');
    //row.addEventListener('click', event => onClick(event, field, (original && original[field.id]) ?? field));
    row.addEventListener('click', event => onClick(event, field, (original && original[field.id]) ?? undefined));
  }

  addTag(row, field.tag);

  //empty indicator execption handling
  var indicator1 = field.ind1;
  var indicator2 = field.ind2;
  const emptyIndicator = '_';
  const eitherIsEmpty = indicator1 === ' ' || indicator2 === ' ';
  const bothAreEmpty = indicator1 === ' ' && indicator2 === ' ';

  if(!bothAreEmpty && eitherIsEmpty){
    indicator1 = field.ind1 === ' ' ? emptyIndicator : field.ind1;
    indicator2 = field.ind2 === ' ' ? emptyIndicator : field.ind2;
  }

  addInd(row, indicator1, indicator2);

  if (field.value) {
    addValue(row, field.value);
  } else if (field.subfields) {
    for (const [index, subfield] of field.subfields.entries()) {
      addSubfield(row, subfield, index);
    }
  }

  div.appendChild(row);
  return row;

  //---------------------------------------------------------------------------

  function addTag(row, value) {
    row.appendChild(makeSpan('tag', value));
  }

  function addInd(row, ind1, ind2) {
    const span = makeSpan('inds');
    add(span, ind1, 'ind1');
    add(span, ind2, 'ind2');
    row.appendChild(span);

    function add(span, ind, className = 'ind') {
      const value = ind && ind.trim() || '&nbsp;';
      span.appendChild(makeSpan(className, null, value));
    }
  }

  function addValue(row, value) {
    row.appendChild(makeSpan('value', value));
  }

  function addSubfield(row, subfield, index = 0) {
    const span = makeSpan('subfield');
    span.appendChild(makeSubfieldCode(subfield.code, index));
    span.appendChild(makeSubfieldData(subfield.value, index));
    row.appendChild(span);
  }

  function makeSubfieldCode(code, index = 0) {
    return makeSpan('code', code, null, index);
  }

  function makeSubfieldData(value, index = 0) {
    return makeSpan('value', value, null, index);
  }

  function decorateField(div, field) {
    if (exclude && exclude[field.id]) {
      div.classList.add('row-excluded');
    }
    if (replace && replace[field.id]) {
      div.classList.add('row-replaced');
      return;
    }
    const source = from && from[field.id];
    if (source == 'source') {
      div.classList.add('row-fromSource');
    }
    if (source == 'base') {
      div.classList.add('row-fromBase');
    }
    if (source == 'insert') {
      div.classList.add('row-fromInsert');
    }
  }
}

function makeDiv(className, value) {
  const div = document.createElement('div');
  div.setAttribute('class', className);
  if (value) {
    div.textContent = value;
  }
  return div;
}

function makeSpan(className, text, html, index = 0) {
  const span = document.createElement('span');
  span.setAttribute('class', className);
  span.setAttribute('index', index);
  if (text) {
    span.textContent = text;
  } else if (html) {
    span.innerHTML = html;
  }
  return span;
}

//-----------------------------------------------------------------------------
// Field edit
//-----------------------------------------------------------------------------

let editing = null;

export function editField(field, original = null, elementToPreactivate = null) {
  // Edit-ohje: https://marc21.kansalliskirjasto.fi/bib/05X-08X.htm#050

  editing = field;
  //editing = transformed.transformed.record.fields.find(f => f.id == field.id);
  //console.log("Edit:", editing);

  // Find field from edited fields, if found, fill in data from there

  const dlg = document.querySelector('#fieldEditDlg');
  //console.log(dlg)
  dlg.style.display = 'flex';

  if (original) {
    const div = document.querySelector('#fieldEditDlg #original');
    div.hidden = false;
    const content = document.querySelector('#fieldEditDlg #field');
    content.innerHTML = '';
    addField(content, original);
  } else {
    const div = document.querySelector('#fieldEditDlg #original');
    div.hidden = true;
  }

  const tag = document.querySelector('#fieldEditDlg #tag');
  tag.innerHTML = '';
  const tagInput = createInput('tag', 'tag', field.tag, undefined, undefined, onEditInputChange);
  tag.appendChild(tagInput);
  preactivateEdit(elementToPreactivate, 'tag', tagInput);
  addInputLimiter(tagInput, 3, ['number', 'upper'], null);

  const ind1 = document.querySelector('#fieldEditDlg #ind1');
  ind1.innerHTML = '';
  const ind1Input = createInput('ind1', 'inds', field.ind1, undefined, undefined, onEditInputChange);
  ind1.appendChild(ind1Input);
  preactivateEdit(elementToPreactivate, 'ind1' ,ind1Input);
  addInputLimiter(ind1Input, 1, ['lower', 'number', 'special'], [' ']);

  const ind2 = document.querySelector('#fieldEditDlg #ind2');
  ind2.innerHTML = '';
  const ind2Input = createInput('ind2', 'inds', field.ind2, undefined, undefined, onEditInputChange);
  ind2.appendChild(ind2Input);
  preactivateEdit(elementToPreactivate, 'ind2' ,ind2Input);
  addInputLimiter(ind2Input, 1, ['lower', 'number', 'special'], [' ']);

  const subfields = document.querySelector('#fieldEditDlg #fieldlist');
  subfields.innerHTML = '';

  const value = document.querySelector('#fieldEditDlg #value');
  value.innerHTML = '';

  const isFixed = isFieldFixedSized(field);
  toggleFieldTypeVisibility(isFixed);
  setEditSaveButtonActiveState(false);

  // if field contains "value" and not "subfields"
  if (field.value) {
    const valueInput = createInput('value', 'value', field.value, undefined, undefined, onEditInputChange);
    value.appendChild(valueInput);
    preactivateEdit(elementToPreactivate, 'value' ,valueInput);

  // if field contains "subfields" and not "value"
  } else if (field.subfields) {

    for (const [index, subfield] of field.subfields.entries()) {
      createSubfield(subfields, subfield, elementToPreactivate, index, ()=>{
          setEditSaveButtonActiveState(hasActiveSubFields(subfields) && hasDataChanged(editing));
      }, onEditInputChange);
    }

    //*
    Sortable.create(subfields, {
      ghostClass: 'ghost-row',
      animation: 50
    });

    /**/
  }

};

function hasActiveSubFields(subfields){
  var containsActiveFields = false;
  for (const subfieldElement of subfields.children) {
    var isActive = true;
    try {
      isActive = subfieldElement.attributes.disabled.nodeValue !== 'true';
    } catch (error) {}

    if(isActive){
      containsActiveFields = true;
      break;
    }
  }
  return containsActiveFields;
}
function toggleFieldTypeVisibility(isFixedField){
  setElementVisibility('fixedFields', isFixedField);
  setElementVisibility('flexFields', !isFixedField);

  setEditIndicatorsVisibility(!isFixedField);
}
function setEditSaveButtonActiveState(isActive){
  setElementState('editSaveButton', isActive);
}
function setEditIndicatorsVisibility(isVisible){
  setElementVisibility('indicators', isVisible);
}
function setEditNewSubfieldButtonVisibility(isVisible){
  setElementVisibility('editAddSubFieldButton', isVisible);
}
function setElementState(elementId, isActive){
  document.getElementById(elementId).disabled = !isActive;
}
function setElementVisibility(elementId, isVisible){
  document.getElementById(elementId).style.visibility = isVisible ? "visible" : "collapse";
}
function setElementText(elementId, text){
  document.getElementById(elementId).textContent = text;
}
function onEditInputChange(e){
  console.log(`Edit updated`);

  const hasChanged = hasDataChanged(editing);
  hasChanged ? console.log('Data Changed') : console.log('Data did not change');
  setElementState('editSaveButton', hasChanged);
  setElementText('editCloseButton', hasChanged ? 'Peru muutokset' : 'Sulje');
}

function hasDataChanged(originalData){
  const isFixed = isFieldFixedSized(originalData);
  const currentField = JSON.parse(JSON.stringify(getCurrentField()));

  if(
    (currentField.tag !== originalData.tag) ||
    (isFixed && currentField.value !== originalData.value) ||
    (!isFixed && currentField.ind1.trim() !== originalData.ind1.trim()) ||
    (!isFixed && currentField.ind2.trim() !== originalData.ind2.trim()) ||
    (!isFixed && currentField.subfields.length !== originalData.subfields.length) ||
    (!isFixed && currentField.subfields.length === originalData.subfields.length && hasSubfieldsValuesChanged())
    ){
      console.log('Editing view detected changes to original data');
      return true;
    }

  console.log('Editing view detected no changes to original data');
  return false;

  //called upon if arrays same length but some value might have changed
  function hasSubfieldsValuesChanged(){
    var hasChanged = false;
    for (const [originalIndex, originalSubfield] of originalData.subfields.entries()) {
      for (const [editedIndex ,currentSubfield] of currentField.subfields.entries()) {
        //console.log(originalSubfield);
        //console.log(currentSubfield);
        if(
          (originalSubfield.code === currentSubfield.code && originalSubfield.value !== currentSubfield.value) ||
          (originalIndex === editedIndex && originalSubfield.code !== currentSubfield.code)
          ){
            console.log(`Subfield ${originalSubfield.code} value has changed`);
            hasChanged = true;
            break;
        }
      }
    }
    return hasChanged;
  }
}

function isFieldFixedSized(fieldObj){
  return fieldObj.value !== null && fieldObj.value !== undefined;
}


/**
 *
 * @param {*} element - input element most likely editable div - cant be empty
 * @param {int} characterLimit - number of characters max, null if dont use
 * @param {[string]} allowedList - allowed character types list (lower/upper/number/speacial) -ie. ['lower', 'upper', 'special']s - null if dont use
 * @param {[string]} specialCharactersAllowed - only acceptable special characters - null if dont use, to work requires allowedlist['speacial']
 * @param {boolean} useDebug - some usefull console logs automatically to be used if true, defaults to false
 *
 * Check with on key down and up what mark is placed into editable div.
 * With key down get the original value and check if key was recordable. Also detect if user long presses key.
 * On key up check any limitations on the new value set.
 * If at any point if bad thing is detected set value back to normal recorded in the onkeydown
 */
function addInputLimiter(element, characterLimit = null, allowedList = null, specialCharactersAllowed = null, useDebug = false){
    var oldValue = '';
    var newValue = '';

    const keysToIgnore = [37, 39, 8, 46];//ignore if using left, right arrow keys, backspace, delete
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    const charModeKeys = {
      lower: 'lower',
      upper: 'upper',
      number: 'number',
      special: 'special'
    };

    var valueSet = false; //value set flag used to detect user pressing long some value
    element.onkeydown = function(e){
      if(!keysToIgnore.includes(e.keyCode)){
        if(!valueSet){
          valueSet = true;
          oldValue = element.innerHTML;
        }else{
          //key down but value is set ? user doing long press on key I suppose
          //should correct itself upon key up but to prevent visual bug set old value
          fallBackToOldValue();
        }
      }
    };
    element.onkeyup = function(e){
      if(!keysToIgnore.includes(e.keyCode) && valueSet){
        valueSet = false;
        newValue = element.innerHTML;
        //checks if certain conditions are met, if not using the recorded old value
        if(characterLimit)
          checkLimit(characterLimit, useDebug);
        if(allowedList)
          checkIfInputHasForbiddenItems(newValue, allowedList, useDebug);
        //here only test only the pressed character
        if(specialCharactersAllowed && hasSpecialCharacters(newValue))
          checkSpecialCharacterExceptions(e.key, specialCharactersAllowed, useDebug);
      }
    };
    function fallBackToOldValue(){
      element.innerHTML = oldValue;
    }

    function checkLimit(limitCount, useDebug = false){
      if(newValue.length > limitCount){
        if(useDebug){
          console.log(`Input was limited by set character limit ${limitCount}`);
        }
        fallBackToOldValue();
      }
    }
    function checkIfInputHasForbiddenItems(value, allowedList = [], useDebug = false){
      if(useDebug){
        if(hasLowerCase(value)){
          console.log('Has lowercase');
        }
        if(hasUpperCase(value)){
          console.log('Has uppercase');
        }
        if(hasNumeric(value)){
          console.log('Has numbers');
        }
        if(hasSpecialCharacters(value)){
          console.log('Has special characters');
        }
      }

      //ok, function takes items that are allowed but for the check we need what is not allowed
      //firstly turn allowed list to forbidden list, aka whats not in the allowed list
      const availableList = Object.values(charModeKeys);
      var forbiddenList = availableList.filter(item => !allowedList.includes(item));

      var hasForbiddenItems = false;
      for (const mode of forbiddenList) {
        switch (mode) {
          case charModeKeys.lower:
              hasForbiddenItems = hasLowerCase(value);
            break;
          case charModeKeys.upper:
              hasForbiddenItems = hasUpperCase(value);
            break;
          case charModeKeys.number:
              hasForbiddenItems = hasNumeric(value);
            break;
          case charModeKeys.special:
            hasForbiddenItems = hasSpecialCharacters(value);
            break;
          default:
              console.log('Specified restriction item was not found');
            break;
        }
      }
      //if new value has items that are not permitted use old one
      if(hasForbiddenItems){
        if(useDebug){
          console.log('Found forbidden items');
        }
        fallBackToOldValue();
      }
    }
    function checkSpecialCharacterExceptions(newKey, specialCharactersAllowed, useDebug = false){
      if(!specialCharactersAllowed.includes(newKey)){
        if(useDebug){
          console.log('Character was forbidden');
        }
        fallBackToOldValue();
      }
    }

    function hasLowerCase(value){
      return value.toUpperCase() !== value;
    }
    function hasUpperCase(value){
      return value.toLowerCase() !== value;
    }
    function hasNumeric(value){
      return /\d/.test(value);
    }
    function hasSpecialCharacters(value){
      return specialChars.test(value);
    }
}

function preactivateEdit(elementToPreactivate, inputClassName , input, index = 0){
  if(elementToPreactivate && inputClassName && input && inputClassName === elementToPreactivate.class && index === elementToPreactivate.index){
    //console.log(`Found correct item at: ${elementToPreactivate.class} in index ${elementToPreactivate.index}`);
    input.focus();
  }
}

function createSubfield(parent, subfield, elementToPreactivate, index = 0, onRemovedCallback = null, onInputChangeCallback = null) {
  const row = document.createElement('div');
  row.classList.add('subfield');
  row.appendChild(removeButton(onRemovedCallback));

  const codeInput = createInput('code', 'code', subfield.code, undefined, index, onInputChangeCallback);
  const valueInput = createInput('value', 'value', subfield.value, undefined, index, onInputChangeCallback);

  row.appendChild(codeInput);
  row.appendChild(valueInput);

  parent.appendChild(row);

  preactivateEdit(elementToPreactivate, 'code', codeInput, index);
  preactivateEdit(elementToPreactivate, 'value', valueInput, index);

  //addInputLimiter(codeInput, 1, ['lower', 'number', 'special'], [' ']);

  return row;

  function removeButton(onRemovedCallback = null) {
    const btn = document.createElement('button');
    btn.classList.add('material-icons');
    btn.innerHTML = 'close';
    btn.addEventListener('click', event => {
      handleRemovedIndicator();
      if(onRemovedCallback){
        onRemovedCallback();
      }
      return true;
    });
    return btn;

    function handleRemovedIndicator(){
      const state = row.getAttribute('disabled');
      if (state) {
        row.removeAttribute('disabled');
      } else {
        row.setAttribute('disabled', true);
      }
    }

  }
}

function createInput(name, className, value, editable = true, index = 0 ,onInputValueChanged = null) {
  const input = document.createElement('span');
  input.setAttribute('id', name);
  input.setAttribute('index', index);
  input.classList.add(className);
  if (editable) {
    input.classList.add('editable');
    if(onInputValueChanged){
      input.addEventListener('input', onInputValueChanged);
    }
  }
  input.textContent = value;
  input.contentEditable = editable;
  return input;
}

window.onAddField = function (event) {
  const subfields = document.querySelector('#fieldEditDlg #fieldlist');
  const newIndex = subfields.children.length;
  createSubfield(subfields, {code: '?', value: '?'}, null, newIndex, () => {
    setEditSaveButtonActiveState(hasActiveSubFields(subfields) && hasDataChanged(editing));
  });

  setEditSaveButtonActiveState(hasActiveSubFields(subfields) && hasDataChanged(editing));
  return eventHandled(event);
};

window.onDeleteField = function(event){
  if(confirm(`Haluatko varmasti poistaa kentän ?`) === true){
    onDeleteField(event, editing);
    return editDlgClose(event);
  }
};

window.editDlgOK = function (event) {

  const field = getCurrentField();
  editSaveField(field);
  return editDlgClose(event);
};

function getCurrentField(){
  const query = (p) => document.querySelector(p);

  const field = {
    id: editing.id,
    tag: query('#fieldEditDlg #tag #tag').textContent,
    ind1: query('#fieldEditDlg #ind1 #ind1').textContent,
    ind2: query('#fieldEditDlg #ind2 #ind2').textContent
  };

  // if field contains "value" and not "subfields"
  if (editing.value) {
    field.value = query('#fieldEditDlg #value #value').textContent;

  // if field contains "subfields" and not "value"
  } else if (editing.subfields) {
    field.subfields = Array.from(query('#fieldEditDlg #fieldlist').childNodes)
      .filter(e => e.classList.contains('subfield'))
      .filter(e => !e.getAttribute('disabled'))
      .map(elem => ({
        code: elem.getElementsByClassName('code')[0].textContent,
        value: elem.getElementsByClassName('value')[0].textContent
      }));
  }
  return field;
};

window.editDlgUseOriginal = function (event) {
  console.log('Using original.');
  editUseOriginal(editing);
  return editDlgClose(event);
};

window.editDlgClose = function (event) {
  const dlg = document.querySelector('#fieldEditDlg');
  //console.log("Close:", dlg)
  dlg.style.display = 'none';
  return eventHandled(event);
};
