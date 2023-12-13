import {requiredFieldsForBook, requiredFieldsForJournal} from '/artikkelit/constants/requiredFields.js';


export function setRequiredFields() {
  const sourceType = document.querySelector('#kuvailtava-kohde').value;

  resetRequiredFields();

  if (sourceType === 'book') {
    setAsRequiredFields(requiredFieldsForBook);
  }

  if (sourceType === 'journal') {
    setAsRequiredFields(requiredFieldsForJournal);
  }

}


function resetRequiredFields() {
  const requiredFields = getAllRequiredFields();

  requiredFields.forEach((field) => {
    field.removeAttribute('required');
  })

}


function setAsRequiredFields(requiredFieldIds) {
  requiredFieldIds.forEach((id) => {
    document.getElementById(id).setAttribute('required', 'true');
  })
}


export function getAllUnfilledRequiredFields() {
  const requiredFields = getAllRequiredFields();

  return requiredFields.filter((field) => field.value === '');
}


export function getAllRequiredFields() {
  return [...articleForm.querySelectorAll('[required]')];
}