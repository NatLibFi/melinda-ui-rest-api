import {idbAddValueToLastIndex, idbGetStoredValues, idbClear} from "/artikkelit/indexDB.js"
import {formToJson, createIconButton, createP} from "/common/ui-utils.js";

export function initArticle() {
  console.log('initializing article...')
  document.getElementById("lisa-tiedot-lisaa-tieteenala").addEventListener("submit", addScience);
  document.getElementById("lisa-tiedot-lisaa-metodologia").addEventListener("submit", addMetodology);

  document.getElementById("tyhjenna-tieteenalat-form").addEventListener("submit", clearSciences);
  document.getElementById("tyhjenna-metodologiat-form").addEventListener("submit", clearMetodologys);

  document.getElementById("lisaa-arvosteltu-teos").addEventListener("click", addReviewedBook);

  refreshSciencesList();
  refreshMetodologysList();
}

function addScience(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  console.log('science');
  const [department, departmentName, subCategory, subject] = formJson['lisa-tiedot-tieteenala'].split(" - ");

  idbAddValueToLastIndex('artoSciences', {department, departmentName, subCategory, subject}).then(() => {
    document.getElementById("lisa-tiedot-tieteenala").value = '';
    refreshSciencesList();
  });
}

function addMetodology(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  console.log('metodology');
  const metodology = formJson['lisa-tiedot-metodologia'];

  idbAddValueToLastIndex('artoMetodologys', {value: metodology}).then(() => {
    document.getElementById("lisa-tiedot-metodologia").value = '';
    refreshMetodologysList();
  });
}

export function refreshSciencesList() {
  console.log('refresh scienceList');
  const scienceList = document.getElementById("tieteenalat-list");
  scienceList.innerHTML = '';

  idbGetStoredValues('artoSciences').then(sciences => {
    sciences.forEach(scienceData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('delete', ['no-border', 'negative'], `return removeScience(event, ${scienceData.key})`, 'Poista');
      div.appendChild(createP('Tieteenala', '', '&nbsp;-&nbsp;', ['label-text']));
      div.appendChild(createP(scienceData.departmentName));
      div.appendChild(createP(scienceData.subject, '&nbsp;-&nbsp;'));
      form.appendChild(div);
      div.appendChild(removeButton);
      scienceList.appendChild(form);
    });

    if (sciences.length > 1) {
      document.getElementById("tyhjenna-tieteenalat-form").style.display = 'block';
    }

    if (sciences.length < 2) {
      document.getElementById("tyhjenna-tieteenalat-form").style.display = 'none';
    }
  });
}

export function clearSciences(event) {
  event.preventDefault();
  idbClear('artoSciences').then(() => refreshSciencesList());
}


export function refreshMetodologysList() {
  console.log('refresh metodologyList');
  const metodologyList = document.getElementById("metodologiat-list");
  metodologyList.innerHTML = '';

  idbGetStoredValues('artoMetodologys').then(metodologys => {
    metodologys.forEach(metodologyData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('delete', ['no-border', 'negative'], `return removeMetodology(event, ${metodologyData.key})`, 'Poista');
      div.appendChild(createP('Metodologia', '', '&nbsp;-&nbsp;', ['label-text']));
      div.appendChild(createP(metodologyData.value));
      div.appendChild(removeButton);
      form.appendChild(div);
      metodologyList.appendChild(form);
    });

    if (metodologys.length > 1) {
      document.getElementById("tyhjenna-metodologiat-form").style.display = 'block';
    }

    if (metodologys.length < 2) {
      document.getElementById("tyhjenna-metodologiat-form").style.display = 'none';
    }
  });
}

export function addReviewedBook(event) {
  event.preventDefault();
  const reviewWrap = document.getElementById("arvosteltu-teos-wrap");
  const upperDiv = document.createElement("div");
  upperDiv.classList.add("full-width");
  const lowerDiv = document.createElement("div");
  lowerDiv.classList.add("Input");
  const removeButton = createIconButton("delete", ["no-border", "negative"], "return removeRewievedBook(event)", "Poista");
  lowerDiv.appendChild(createLabel("arvosteltu-teos", "Arvosteltu teos:"));
  lowerDiv.appendChild(createInput("arvosteltu-teos", "full-width", ""));
  lowerDiv.appendChild(createDatalist(""));
  lowerDiv.appendChild(createLabel("arvosteltu-teos-isbn", "ISBN:"));
  lowerDiv.appendChild(createInput("arvosteltu-teos-isbn", "half-width", false, true));
  upperDiv.appendChild(lowerDiv);
  upperDiv.appendChild(removeButton);
  reviewWrap.appendChild(upperDiv);

  function createLabel(id, text) {
    const label = document.createElement("label");
    label.classList.add("bold-text");
    label.setAttribute("for", id);
    label.innerHTML = text;
    return label;
  }

  function createInput(name, cls, list = false, disabled = false) {
    // readOnly vai disabled?
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("id", name);
    input.setAttribute("name", name);
    input.classList.add(cls);
    if (list) {
      input.setAttribute("list", list);
    }
    input.disabled = disabled;
    return input;
  }

  function createDatalist(id) {
    const datalist = document.createElement("datalist");
    datalist.setAttribute("id", id);
    return datalist;
  }
}

export function clearMetodologys(event) {
  event.preventDefault();
  idbClear('artoMetodologys').then(() => refreshMetodologysList());
}
