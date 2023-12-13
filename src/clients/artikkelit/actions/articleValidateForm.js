import {requiredFieldsForBook, requiredFieldsForJournal} from '/artikkelit/constants/requiredFields.js';
import {subforms} from '/artikkelit/constants/subforms.js';



/*****************************************************************************/
/* FORM VALIDATING                                                           */
/*****************************************************************************/


export function validateForm() {
  const unfilledRequiredFields = getAllUnfilledRequiredFields();
  const incompleteSubforms = getAllIncompleteSubforms();

  const formErrors = [
    ...unfilledRequiredFields,
    ...incompleteSubforms
  ]

  console.log('formErrors: ', formErrors)

  subforms.forEach(formId => {
    getFieldsetLegend(formId);
  })

  return formErrors;
}


export function getAllUnfilledRequiredFields() {
  const requiredFields = getAllRequiredFields();
  return requiredFields.filter(fieldIsEmpty);
}

export function getAllIncompleteSubforms() {
  const subforms = getAllSubforms();
  return subforms.filter(formIsIncomplete);
}


/*****************************************************************************/
/* SUBFORMS                                                                  */
/*****************************************************************************/

export function getAllSubforms() {
  return subforms.map((formId) => document.getElementById(formId));
}

function formIsIncomplete(form) {
  const formInputs = getInputs(form);
  return formInputs.filter(fieldIsFilled).length > 0;
}

function getInputs(form) {
  const inputs = form.querySelectorAll('input');
  return [...inputs];
}

/*****************************************************************************/
/* REQUIRED FIELDS                                                           */
/*****************************************************************************/

export function getAllRequiredFields() {
  const articleForm = document.getElementById('articleForm');

  return [...articleForm.querySelectorAll('[required]')];
}

function resetRequiredFields() {
  const requiredFields = getAllRequiredFields();

  requiredFields.forEach((field) => {
    field.removeAttribute('required');
  })

}

export function setRequiredFields() {
  const sourceType = document.querySelector('#kuvailtava-kohde').value;

  resetRequiredFields();

  if (sourceType === 'book') {
    setAsRequiredFields(requiredFieldsForBook);
  }

  if (sourceType === 'journal') {
    setAsRequiredFields(requiredFieldsForJournal);
  }

  function setAsRequiredFields(requiredFieldIds) {
    requiredFieldIds.forEach((id) => {
      document.getElementById(id).setAttribute('required', 'true');
    })
  }


}


/*****************************************************************************/
/* HELPERS                                                                   */
/*****************************************************************************/

function fieldIsEmpty(field) {
  return field.value === '';
}

function fieldIsFilled(field) {
  return field.value !== '';
}

function getFieldsetLegend(formId) {
  const form = document.getElementById(formId);
  const fieldset = form.closest('fieldset');
  const legend = fieldset.querySelector('legend')
  return legend.innerHTML;
}