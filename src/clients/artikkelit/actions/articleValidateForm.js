import {requiredFieldsForBook, requiredFieldsForJournal, subforms} from '/artikkelit/constants/index.js';


/*****************************************************************************/
/* FORM VALIDATING                                                           */
/*****************************************************************************/


export function validateForm() {
  const unfilledRequiredFields = getAllUnfilledRequiredFields();
  const unsubmittedFields = getAllUnsubmittedFields();

  const formErrors = [
    ...unfilledRequiredFields.map((field) => createFieldErrorObject(field, 'unfilledRequiredField')),
    ...unsubmittedFields.map((field) => createFieldErrorObject(field, 'unsubmittedField'))
  ];

  console.log('formErrors: ', formErrors)

  return formErrors;
}


function getAllUnfilledRequiredFields() {
  const articleForm = document.getElementById('articleForm');

  const requiredFields = getAllRequiredFields(articleForm);
  const unfilledRequiredFields = requiredFields.filter(fieldIsEmpty);

  return unfilledRequiredFields;
}

function getAllUnsubmittedFields() {
  const unsubmittedFields = subforms.flatMap((subform) => getChangedFieldsInForm(subform))

  return unsubmittedFields;
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

function getFieldsetId(elementId) {
  const element = document.getElementById(elementId);
  const fieldset = element.closest('fieldset');
  return fieldset.id;
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
    'fieldsetId': getFieldsetId(element.id),
    'fieldsetLegend': getFieldsetLegend(element.id)
  };
}
