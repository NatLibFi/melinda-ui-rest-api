import {idbSet, idbKeys} from "/artikkelit/indexDB.js"

export function addTempOrganization({organizationName, code, organizationShortTerm, note}) {
  const oldItems = window.sessionStorage.getItem('melinda-temp-organizations');
  if (oldItems === null) {
    window.sessionStorage.setItem('melinda-temp-organizations', JSON.stringify([{organizationName, code, organizationShortTerm, note}]));
    return true;
  }

  const oldItemsArray = JSON.parse(oldItems);
  const hasValue = oldItemsArray.some(item => item.code === `${code}`);

  if (hasValue) {
    return false;
  }

  if (!code && organizationShortTerm) {
    window.sessionStorage.setItem('melinda-temp-organizations', JSON.stringify([...JSON.parse(oldItems), {organizationName, code: organizationShortTerm, organizationShortTerm, note}]));
  }

  window.sessionStorage.setItem('melinda-temp-organizations', JSON.stringify([...JSON.parse(oldItems), {organizationName, code, organizationShortTerm, note}]));
  return true;
}

export function removeTempOrganization(code) {
  const oldItems = window.sessionStorage.getItem('melinda-temp-organizations');
  if (oldItems === null) {
    return true;
  }

  const oldItemsArray = JSON.parse(oldItems);
  const hasValue = oldItemsArray.some(item => item.code === `${code}`);

  if (hasValue) {
    const newItems = oldItemsArray.filter(item => item.code !== `${code}`);
    window.sessionStorage.setItem('melinda-temp-organizations', JSON.stringify(newItems));
    return true;
  }

  return true;
}

export function resetTempOrganizationList() {
  window.sessionStorage.removeItem('melinda-temp-organizations');
}

export function getTempOrganizationList() {
  const oldItems = window.sessionStorage.getItem('melinda-temp-organizations');
  if (oldItems === null) {
    return [];
  }

  return JSON.parse(oldItems);
}

export function createP(value, before = '', after = '') {
  const p = document.createElement('p');
  p.innerHTML = `${before}${value}${after}`;
  return p;
}

export function createHiddenInput(value, name) {
  const input = document.createElement('input');
  input.setAttribute("type", 'hidden');
  input.setAttribute("value", value);
  input.setAttribute("name", name);
  return input;
}

export function createIconButton(icon, classList = [], onclickAttribute = false, tooltip = false) {
  const button = document.createElement('button');
  button.innerHTML = icon;
  button.classList.add('material-icons');
  classList.forEach(htmlClass => button.classList.add(htmlClass));
  if (onclickAttribute) {
    button.setAttribute('onclick', onclickAttribute);
  }

  if (tooltip) {
    button.classList.add('tooltip');
    button.setAttribute("tooltip-text", tooltip);
  }

  return button;
}

export function addAuthorToIdbIndex({firstName, lastName, relator, authorsTempOrganizations}) {
  return idbKeys('artoAuthors').then(indexes => {
    if (indexes.length === 0) {
      return idbSet('artoAuthors', 1, {firstName, lastName, relator, authorsTempOrganizations});
    }

    const lastIndex = [...indexes].pop();
    const newIndex = lastIndex + 1;

    return idbSet('artoAuthors', newIndex, {firstName, lastName, relator, authorsTempOrganizations});
  });
}
