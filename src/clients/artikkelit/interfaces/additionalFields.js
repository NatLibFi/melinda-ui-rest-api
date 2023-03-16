import {idbAddValueToLastIndex, idbGetStoredValues, idbClear} from "/artikkelit/indexDB.js"
import {formToJson, createIconButton, createP, showSnackbar} from "/common/ui-utils.js";

export function initAdditionalFields() {
  console.log('initializing additional fields...');
  document.getElementById("yleinen-huomautus-lisaa-form").addEventListener("submit", addNote);
  document.getElementById("artikkelin-muu-nimeke-lisaa-form").addEventListener("submit", addOtherTitle);
  document.getElementById("UDK-lisaa-form").addEventListener("submit", addUDK);
  document.getElementById("muu-luokitus-lisaa-form").addEventListener("submit", addOtherRating);

  document.getElementById("tyhjenna-yleiset-huomautukset-form").addEventListener("submit", clearNotes);
  document.getElementById("tyhjenna-muut-nimekkeet-form").addEventListener("submit", clearOtherTitles);
  document.getElementById("tyhjenna-udk-kentat-form").addEventListener("submit", clearUDKs);
  document.getElementById("tyhjenna-muut-luokitukset-form").addEventListener("submit", clearOtherRatings);

  refreshNotesList();
  refreshOtherTitlesList();
  refreshUDKsList();
  refreshOtherRatingsList();
}

export function addNote(event) {
  event.preventDefault();
  const formJson = formToJson(event);

  const data = {
    value: formJson['lisakentat-yleinen-huomautus']
  }

  if (data.value === "") {
    showSnackbar({text: "Yleinen huomautus ei voi olla tyhjä", closeButton: "true"});
    return;
  }

  idbAddValueToLastIndex('artoNotes', data).then(() => {
    document.getElementById('lisakentat-yleinen-huomautus').value = "";
    refreshNotesList();
  });
}

export function refreshNotesList() {
  const notesList = document.getElementById('huomautukset-list');
  notesList.innerHTML = '';

  idbGetStoredValues('artoNotes').then(notes => {
    notes.forEach(noteData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('delete', ['no-border', 'negative'], `return removeNote(event, ${noteData.key})`, 'Poista')
      div.appendChild(createP('Yleinen huomautus', '', '&nbsp;-&nbsp;', ['label-text']));
      div.appendChild(createP(noteData.value));
      div.appendChild(removeButton);
      form.appendChild(div);
      notesList.appendChild(form)
    });

    if (notes.length > 1) {
      document.getElementById("tyhjenna-yleiset-huomautukset-form").style.display = 'block';
    }

    if (notes.length < 2) {
      document.getElementById("tyhjenna-yleiset-huomautukset-form").style.display = 'none';
    }
  });
}

export function clearNotes(event) {
  event.preventDefault();
  idbClear('artoNotes').then(() => refreshNotesList());
}

export function addOtherTitle(event) {
  event.preventDefault();
  const formJson = formToJson(event);

  const data = {
    value: formJson['artikkelin-muu-nimeke']
  }

  if (data.value === "") {
    showSnackbar({text: "Muu nimeke ei voi olla tyhjä", closeButton: "true"});
    return;
  }

  idbAddValueToLastIndex('artoOtherTitles', data).then(() => {
    document.getElementById('artikkelin-muu-nimeke').value = "";
    refreshOtherTitlesList();
  });
}

export function refreshOtherTitlesList() {
  const otherTitlesList = document.getElementById('muut-nimekkeet-list');
  otherTitlesList.innerHTML = '';

  idbGetStoredValues('artoOtherTitles').then(otherTitles => {
    otherTitles.forEach(otherTitleData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('delete', ['no-border', 'negative'], `return removeOtherTitle(event, ${otherTitleData.key})`, 'Poista')
      div.appendChild(createP('Muu nimeke', '', '&nbsp;-&nbsp;', ['label-text']));
      div.appendChild(createP(otherTitleData.value));
      div.appendChild(removeButton);
      form.appendChild(div);
      otherTitlesList.appendChild(form)
    });

    if (otherTitles.length > 1) {
      document.getElementById("tyhjenna-muut-nimekkeet-form").style.display = 'block';
    }

    if (otherTitles.length < 2) {
      document.getElementById("tyhjenna-muut-nimekkeet-form").style.display = 'none';
    }
  });
}

export function clearOtherTitles(event) {
  event.preventDefault();
  idbClear('artoOtherTitles').then(() => refreshOtherTitlesList());
}

export function addUDK(event) {
  event.preventDefault();
  const formJson = formToJson(event);

  const data = {
    a080: formJson['lisakentat-UDK080a'],
    x080: formJson['lisakentat-UDK080x']
  }

  if (data.a080 === "") {
    showSnackbar({text: "UDK (080 $a) -arvo ei voi olla tyhjä", closeButton: "true"});
    return;
  }

  idbAddValueToLastIndex('artoUDKs', data).then(() => {
    document.getElementById('lisakentat-UDK080a').value = "";
    document.getElementById('lisakentat-UDK080x').value = "";
    refreshUDKsList();
  });
}

export function refreshUDKsList() {
  const udksList = document.getElementById('udk-list');
  udksList.innerHTML = '';

  idbGetStoredValues('artoUDKs').then(udks => {
    udks.forEach(udkData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('delete', ['no-border', 'negative'], `return removeUDK(event, ${udkData.key})`, 'Poista')
      div.appendChild(createP('UDK (080 $a)', '', '&nbsp;', ['label-text']));
      div.appendChild(createP(udkData.a080));
      div.appendChild(createP('UDK (080 $x)', '&nbsp;', '&nbsp;', ['label-text']));
      div.appendChild(createP(udkData.x080));
      div.appendChild(removeButton);
      form.appendChild(div);
      udksList.appendChild(form)
    });

    if (udks.length > 1) {
      document.getElementById("tyhjenna-udk-kentat-form").style.display = 'block';
    }

    if (udks.length < 2) {
      document.getElementById("tyhjenna-udk-kentat-form").style.display = 'none';
    }
  });
}

export function clearUDKs(event) {
  event.preventDefault();
  idbClear('artoUDKs').then(() => refreshUDKsList());
}

export function addOtherRating(event) {
  event.preventDefault();
  const formJson = formToJson(event);

  const data = {
    a084: formJson['lisakentat-muu-luokitus-084a'],
    two084: formJson['lisakentat-luokituksen-lahde-0842']
  }

  if (data.a084 === "" || data.two084 === "") {
    showSnackbar({text: "Muun luokituksen tiedot eivät voi olla tyhjiä", closeButton: "true"});
    return;
  }

  idbAddValueToLastIndex('artoOtherRatings', data).then(() => {
    document.getElementById('lisakentat-muu-luokitus-084a').value = "";
    document.getElementById('lisakentat-luokituksen-lahde-0842').value = "";
    refreshOtherRatingsList();
  });
}

export function refreshOtherRatingsList() {
  const otherRatingsList = document.getElementById('muu-luokitus-list');
  otherRatingsList.innerHTML = '';

  idbGetStoredValues('artoOtherRatings').then(otherRatings => {
    otherRatings.forEach(otherRatingData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('delete', ['no-border', 'negative'], `return removeotherRating(event, ${otherRatingData.key})`, 'Poista')
      div.appendChild(createP('Muu luokitus (084 $a)', '', '&nbsp;', ['label-text']));
      div.appendChild(createP(otherRatingData.a084));
      div.appendChild(createP('Luokituksen lähde ($2)', '&nbsp;', '&nbsp;', ['label-text']));
      div.appendChild(createP(otherRatingData.two084));
      div.appendChild(removeButton);
      form.appendChild(div);
      otherRatingsList.appendChild(form)
    });

    if (otherRatings.length > 1) {
      document.getElementById("tyhjenna-muut-luokitukset-form").style.display = 'block';
    }

    if (otherRatings.length < 2) {
      document.getElementById("tyhjenna-muut-luokitukset-form").style.display = 'none';
    }
  });
}

export function clearOtherRatings(event) {
  event.preventDefault();
  idbClear('artoOtherRatings').then(() => refreshOtherRatingsList());
}
