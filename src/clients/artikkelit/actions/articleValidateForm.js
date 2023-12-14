import {requiredFieldsForBook, requiredFieldsForJournal} from '/artikkelit/constants/requiredFields.js';
import {subforms} from '/artikkelit/constants/subforms.js';



/*****************************************************************************/
/* FORM VALIDATING                                                           */
/*****************************************************************************/


export function validateForm() {
  const unfilledRequiredFields = getAllUnfilledRequiredFields();
  const unsubmittedFields = getAllUnsubmittedFields();

  const formErrors = [...unfilledRequiredFields, ...unsubmittedFields];

  return formErrors;
}


export function getAllUnfilledRequiredFields() {
  const articleForm = document.getElementById('articleForm');

  const requiredFields = getAllRequiredFields(articleForm);
  const unfilledRequiredFields = requiredFields.filter(fieldIsEmpty);

  return unfilledRequiredFields.map((field) => createFieldErrorObject(field, 'unfilledRequiredField'));
}

function getAllUnsubmittedFields() {
  const unsubmittedFields = subforms.flatMap((subform) => getChangedFieldsInForm(subform))

  return unsubmittedFields.map((field) => createFieldErrorObject(field, 'unsubmittedField'));
}


/*****************************************************************************/
/* SUBFORMS                                                                  */
/*****************************************************************************/

function getChangedFieldsInForm(formId) {
  const form = document.getElementById(formId);

  const formInputs = getInputs(form);
  const formTextareas = getTextareas(form);
  const formSelects = getSelects(form);

  const filledFields = [...formInputs, ...formTextareas].filter(fieldIsFilled);
  const changedSelects = formSelects.filter(selectIsChanged);

  return [...filledFields, ...changedSelects];
}


/*****************************************************************************/
/* REQUIRED FIELDS                                                           */
/*****************************************************************************/

export function getAllRequiredFields(form) {
  return [...form.querySelectorAll('[required]')];
}

function resetRequiredFields(form) {
  const requiredFields = getAllRequiredFields(form);

  requiredFields.forEach((field) => {
    field.removeAttribute('required');
  })

}

export function setRequiredFields() {
  const articleForm = document.getElementById('articleForm');
  const sourceType = document.querySelector('#kuvailtava-kohde').value;

  resetRequiredFields(articleForm);

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

function selectIsChanged(select) {
  return select.selectedIndex !== 0
}

function getInputs(form) {
  const inputs = form.querySelectorAll('input');
  return [...inputs];
}

function getTextareas(form) {
  const textareas = form.querySelectorAll('textarea');
  return [...textareas];
}

function getSelects(form) {
  const selects = form.querySelectorAll('select');
  return [...selects];
}

function getFieldsetLegend(elementId) {
  const element = document.getElementById(elementId);
  const fieldset = element.closest('fieldset');
  const legend = fieldset.querySelector('legend')
  return legend.innerHTML;
}

function getLabel(elementId) {
  const label = document.querySelector(`label[for=${elementId}]`);
  return label.innerHTML;
}

function createFieldErrorObject(element, type) {
  return {
    'errorType': type,
    'elementId': element.id,
    'element': element,
    'label': getLabel(element.id),
    'fieldsetLegend': getFieldsetLegend(element.id)
  };
}
