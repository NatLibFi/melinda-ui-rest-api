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

export function getOntologyOptions(ontology) {
  const sweOntologies = ["allfo", "allfoOrter", "fgf"];
  const localOntologies = ["other", "otherPerson", "otherCommunity", "otherTime"];

  const vocabularies = {
    yso: 'yso',
    allfo: 'yso',
    slm: 'slm',
    fgf: 'slm',
    ysoPaikat: 'yso-paikat',
    allfoOrter: 'yso-paikat',
    kassu: 'kassu',
    afo: 'afo',
    maotao: 'maotao',
    soto: 'soto',
    yhteiso: 'cn',
    finmesh: 'mesh'
  }

  const searchVocab = vocabularies[ontology];
  const language = sweOntologies.includes(ontology) ? 'sv' : 'fi';

  if (localOntologies.includes(ontology)) {
    return {
      searchVocab: 'local',
      language
    };
  }

  return {
    searchVocab,
    language
  };
}

export function setOptions(element, jsonArray, disabled = false) {
  element.innerHTML = '';
  jsonArray.forEach((obj, index) => {
    const opt = document.createElement('option');
    opt.value = obj.value;
    opt.innerHTML = obj.text;
    opt.selected = disabled;
    opt.disabled = disabled;
    element.append(opt);
    if (element.nodeName === 'select' && index === 0) {
      element.selectedIndex = 0;
    }
  });

  element.dispatchEvent(new Event('change'));
}
