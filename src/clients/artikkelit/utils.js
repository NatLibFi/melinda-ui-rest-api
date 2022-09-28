export function createP(value, before = '', after = '', classList = []) {
  const p = document.createElement('p');
  p.innerHTML = `${before}${value}${after}`;
  classList.forEach(htmlClass => p.classList.add(htmlClass));
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
  button.classList.add('icon');

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
  const sweOntologies = ["allfo", "allfoOrter", "allfoTid", "fgf"];
  const localOntologies = ["other", "otherPerson", "otherCommunity", "otherTime"];

  const vocabularies = {
    yso: 'yso',
    allfo: 'yso',
    ysoPaikat: 'yso-paikat',
    allfoOrter: 'yso-paikat',
    ysoAika: 'yso-aika',
    allfoTid: 'yso-aika',
    slm: 'slm',
    fgf: 'slm',
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
