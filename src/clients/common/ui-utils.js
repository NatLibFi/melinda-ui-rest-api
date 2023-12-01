//*****************************************************************************
//
// Utilities for UI
//
//*****************************************************************************

import {startProcess, stopProcess} from './progressbar.js';
import {showNotificationBanner} from './notificationBanner.js';
import {showNotificationDialog} from './notificationDialog.js';

export {startProcess, stopProcess, showNotificationBanner, showNotificationDialog};

//-----------------------------------------------------------------------------

window.eventHandled = function (e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }

  return true;
};

window.ignore = function (e) {
  return eventHandled(e);
};


//-----------------------------------------------------------------------------
// Helper for HTML component: accordion
//-----------------------------------------------------------------------------

window.toggleAccordion = function(event) {
  const accordionId = event.target.id;
  const accordion = document.getElementById(accordionId);

  accordion.classList.toggle('expanded');

  return eventHandled(event);
};


//-----------------------------------------------------------------------------

export function formToJson(formSubmitEvent) {
  const formData = new FormData(formSubmitEvent.target);
  const formJson = {};
  formData.forEach((value, key) => {
    if (key.indexOf('-array') > -1) {
      if (formJson[key] === undefined) {
        return formJson[key] = [value];
      }
      return formJson[key].push(value);
    }

    return formJson[key] = value;
  });
  return formJson;
}

export function createP(value, before = '', after = '', classList = []) {
  const p = document.createElement('p');
  p.innerHTML = `${before}${value}${after}`;
  classList.forEach(htmlClass => p.classList.add(htmlClass));
  return p;
}

export function createHiddenInput(value, name) {
  const input = document.createElement('input');
  input.setAttribute('type', 'hidden');
  input.setAttribute('value', value);
  input.setAttribute('name', name);
  return input;
}

export function createIconButton(icon, classList = [], onclickAttribute = false, tooltip = false) {
  const button = document.createElement('button');
  button.innerHTML = icon;
  button.classList.add('material-icons');
  button.classList.add('icon-only');

  classList.forEach(htmlClass => button.classList.add(htmlClass));
  if (onclickAttribute) {
    button.setAttribute('onclick', onclickAttribute);
  }

  if (tooltip) {
    button.classList.add('tooltip');
    button.setAttribute('tooltip-text', tooltip);
  }

  return button;
}

export function setOptions(element, jsonArray, disabled = false, textValue = false) {
  element.innerHTML = '';
  if (textValue) {
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.innerHTML = textValue;
    element.append(defaultOpt);
  }
  jsonArray.forEach((obj, index) => {
    const opt = document.createElement('option');
    opt.value = obj.value;
    opt.innerHTML = obj.text;
    opt.selected = disabled;
    opt.disabled = disabled;
    if (obj.code) {
      opt.dataset.code = obj.code;
    }
    element.append(opt);
    if (element.nodeName === 'select' && index === 0) {
      element.selectedIndex = 0;
    }
  });

  element.dispatchEvent(new Event('change'));
}

export function showTab(...tabs) {
  const root = document.getElementById('root');
  for (const child of root.children) {
    if (tabs.includes(child.getAttribute('id'))) {
      child.hidden = false;
      child.style.display = null;
    } else {
      child.hidden = true;
      child.style.display = 'none';
    }
  }
}

export function resetForms(...elems) {
  for (const elem of elems) {
    const forms = elem.querySelectorAll('form');
    for (const form of forms) {
      form.reset();
    }
  }
}

export function reload() {
  // Programmatically reload page and reset forms
  location.reload();
}

//-----------------------------------------------------------------------------

export function createMenuItem(name, className) {
  const item = document.createElement('div');
  item.classList.add(className);
  item.innerHTML = name;
  return item;
}

export function createMenuSelection(group, value, desc, className) {
  const id = `${group}-${value}`;
  const item = createMenuItem('', className);
  const radiobtn = document.createElement('input');
  radiobtn.setAttribute('type', 'radio');
  radiobtn.setAttribute('id', id);
  radiobtn.setAttribute('name', group);
  radiobtn.setAttribute('value', value);
  radiobtn.setAttribute('value', value);

  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.innerHTML = desc;

  item.appendChild(radiobtn);
  item.appendChild(label);
  return item;
}

export function createMenuBreak() {
  const item = document.createElement('hr');
  return item;
}

export function createDropdownItem(name, classNames, labelText) {
  const item = document.createElement('div');
  item.classList.add(...classNames);
  item.innerHTML = name;
  item.appendChild(createSelectLabel(labelText));
  return item;
}

export function createSelectLabel(text) {
  const label = document.createElement('label');
  label.innerHTML = text;
  return label;
}

export function createSelectItem(group) {
  const select = document.createElement('select');
  select.setAttribute('name', group);
  return select;
}

export function createSelectOption(value, desc) {
  const option = document.createElement('option');
  option.setAttribute('value', value);
  option.innerHTML = desc;
  return option;
}

//-----------------------------------------------------------------------------
// HTML element helper functions for Viewer
//-----------------------------------------------------------------------------

// creates a new html element option and returns it
// text and value attributes of element are given as parameters
export function createOption(text, value) {
  const option = document.createElement('option');
  option.text = text;
  option.value = value;

  return option;
}

// enables the html element given as parameter
export function enableElement(element) {
  element.removeAttribute('disabled');
}

// disables the html element given as parameter
export function disableElement(element) {
  element.disabled = true;
}

// returns true if element is not visible
export function isHidden(element) {
  return (element.offsetParent === null)
}

// returns true if element is hidden
export function isVisible(element) {
  return (element.offsetParent !== null)
}

// highligts a html element with a background color for a moment
// if no color is given as parameter, uses default color defined in the CSS
export function highlightElement(element, color) {
  element.classList.add('highlight');

  if (color) {
    element.style.setProperty(`--highlightcolor`, color);
  }

  setTimeout(() => {
    element.classList.remove('highlight');
  }, 5000);
}

// returns an array of all html element descendants of the parent element
export function getAllDescendants(parentElement) {
  const allDescendantElements = parentElement.getElementsByTagName('*');
  return [...allDescendantElements];
}
