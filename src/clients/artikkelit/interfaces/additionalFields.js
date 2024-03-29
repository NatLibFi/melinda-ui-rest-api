import {idbAddValueToLastIndex, idbClear, idbDel, idbGetStoredValues} from '/artikkelit/utils/indexedDB.js';
import {createIconButton, createP, formToJson, showNotification} from '/common/ui-utils.js';

export function initAdditionalFields() {
  //console.log('initializing additional fields...');
  document.getElementById('yleinen-huomautus-lisaa-form').addEventListener('submit', addNote);
  document.getElementById('artikkelin-muu-nimeke-lisaa-form').addEventListener('submit', addOtherTitle);
  document.getElementById('UDK-lisaa-form').addEventListener('submit', addUDK);
  document.getElementById('muu-luokitus-lisaa-form').addEventListener('submit', addOtherRating);

  document.getElementById('tyhjenna-yleiset-huomautukset-form').addEventListener('submit', clearNotes);
  document.getElementById('tyhjenna-muut-nimekkeet-form').addEventListener('submit', clearOtherTitles);
  document.getElementById('tyhjenna-udk-kentat-form').addEventListener('submit', clearUDKs);
  document.getElementById('tyhjenna-muut-luokitukset-form').addEventListener('submit', clearOtherRatings);

  refreshNotesList();
  refreshOtherTitlesList();
  refreshUDKsList();
  refreshOtherRatingsList();
}

export function refreshNotesList() {
  const notesList = document.getElementById('huomautukset-list');
  notesList.innerHTML = '';

  idbGetStoredValues('artoNotes').then(notes => {
    notes.forEach(noteData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('delete_outline', ['alternate-red', 'small'], `return removeNote(event, ${noteData.key})`, 'Poista');
      div.appendChild(createP('Yleinen huomautus', '', '&nbsp;-&nbsp;', ['label-text']));
      div.appendChild(createP(noteData.value));
      div.appendChild(removeButton);
      form.appendChild(div);
      notesList.appendChild(form);
    });

    if (notes.length > 1) {
      document.getElementById('tyhjenna-yleiset-huomautukset-form').style.display = 'block';
    }

    if (notes.length < 2) {
      document.getElementById('tyhjenna-yleiset-huomautukset-form').style.display = 'none';
    }
  });

  doUpdate();
}

export function refreshUDKsList() {
  const udksList = document.getElementById('udk-list');
  udksList.innerHTML = '';

  idbGetStoredValues('artoUDKs').then(udks => {
    udks.forEach(udkData => {
      const form = document.createElement('form');
      const div = document.createElement('div');

      if (!udkData.a080) {
        //x080 or two080 can be displayed only if also a080 is displayed
        return;
      }

      div.appendChild(createP('UDK-luokitus (080 $a)', '', '&nbsp;', ['label-text']));
      div.appendChild(createP(udkData.a080));

      if (udkData.x080) {
        div.appendChild(createP('Lisäluokka (080 $x)', '&nbsp;', '&nbsp;', ['label-text']));
        div.appendChild(createP(udkData.x080));
      }

      if (udkData.two080) {
        div.appendChild(createP('Luokituksen lähde (080 $2)', '&nbsp;', '&nbsp;', ['label-text']));
        div.appendChild(createP(udkData.two080));
      }

      const removeButton = createIconButton('delete_outline', ['alternate-red', 'small'], `return removeUDK(event, ${udkData.key})`, 'Poista');
      div.appendChild(removeButton);

      div.classList.add('full-width');

      form.appendChild(div);
      udksList.appendChild(form);
    });

    if (udks.length > 1) {
      document.getElementById('tyhjenna-udk-kentat-form').style.display = 'block';
    }

    if (udks.length < 2) {
      document.getElementById('tyhjenna-udk-kentat-form').style.display = 'none';
    }
  });

  doUpdate();
}

export function refreshOtherTitlesList() {
  const otherTitlesList = document.getElementById('muut-nimekkeet-list');
  otherTitlesList.innerHTML = '';

  idbGetStoredValues('artoOtherTitles').then(otherTitles => {
    otherTitles.forEach(otherTitleData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('delete_outline', ['alternate-red', 'small'], `return removeOtherTitle(event, ${otherTitleData.key})`, 'Poista');
      div.appendChild(createP('Muu nimeke', '', '&nbsp;-&nbsp;', ['label-text']));
      div.appendChild(createP(otherTitleData.value));
      div.appendChild(removeButton);
      form.appendChild(div);
      otherTitlesList.appendChild(form);
    });

    if (otherTitles.length > 1) {
      document.getElementById('tyhjenna-muut-nimekkeet-form').style.display = 'block';
    }

    if (otherTitles.length < 2) {
      document.getElementById('tyhjenna-muut-nimekkeet-form').style.display = 'none';
    }
  });

  doUpdate();
}

export function refreshOtherRatingsList() {
  const otherRatingsList = document.getElementById('muu-luokitus-list');
  otherRatingsList.innerHTML = '';

  idbGetStoredValues('artoOtherRatings').then(otherRatings => {
    otherRatings.forEach(otherRatingData => {
      const form = document.createElement('form');
      const div = document.createElement('div');

      if (!otherRatingData.a084) {
        //a084 is required field, two084 can not be displayed without a084
        return;
      }

      div.appendChild(createP('Muu luokitus (084 $a)', '', '&nbsp;', ['label-text']));
      div.appendChild(createP(otherRatingData.a084));

      if (otherRatingData.two084) {
        div.appendChild(createP('Luokituksen lähde ($2)', '&nbsp;', '&nbsp;', ['label-text']));
        div.appendChild(createP(otherRatingData.two084));
      }

      const removeButton = createIconButton('delete_outline', ['alternate-red', 'small'], `return removeotherRating(event, ${otherRatingData.key})`, 'Poista');
      div.appendChild(removeButton);

      div.classList.add('full-width');

      form.appendChild(div);
      otherRatingsList.appendChild(form);
    });

    if (otherRatings.length > 1) {
      document.getElementById('tyhjenna-muut-luokitukset-form').style.display = 'block';
    }

    if (otherRatings.length < 2) {
      document.getElementById('tyhjenna-muut-luokitukset-form').style.display = 'none';
    }
  });

  doUpdate();
}

window.removeNote = (event, key) => {
  event.preventDefault();
  idbDel('artoNotes', key).then(() => refreshNotesList());
};

window.removeotherRating = (event, key) => {
  event.preventDefault();
  idbDel('artoOtherRatings', key).then(() => refreshOtherRatingsList());
};

window.removeOtherTitle = (event, key) => {
  event.preventDefault();
  idbDel('artoOtherTitles', key).then(() => refreshOtherTitlesList());
};

window.removeUDK = (event, key) => {
  event.preventDefault();
  idbDel('artoUDKs', key).then(() => refreshUDKsList());
};

function addNote(event) {
  event.preventDefault();
  const formJson = formToJson(event);

  const data = {
    value: formJson['lisakentat-yleinen-huomautus']
  };

  if (data.value === '') {
    showNotification({componentStyle: 'banner', style: 'alert', text: 'Yleinen huomautus ei voi olla tyhjä'});
    return;
  }

  const lastChar = data.value.charAt(data.value.length - 1);

  if (lastChar !== '.' && lastChar !== '!' && lastChar !== '?') {
    showSnackbar({style: 'alert', text: 'Yleisen huomatuksen täytyy päättyä pisteeseen, huutomerkkiin tai kysymysmerkkiin'});
    return;
  }

  idbGetStoredValues('artoNotes').then(notes => {
    if (notes.some(note => note.value === data.value)) {
      showNotification({componentStyle: 'banner', style: 'alert', text: 'Artikkelille on jo lisätty tämä yleinen huomautus'});
      return;
    }

    idbAddValueToLastIndex('artoNotes', data).then(() => {
      document.getElementById('lisakentat-yleinen-huomautus').value = '';
      refreshNotesList();
    });
  });
}

export function addOtherRating(event) {
  event.preventDefault();
  const formJson = formToJson(event);

  const data = {
    a084: formJson['lisakentat-muu-luokitus-084a'],
    two084: formJson['lisakentat-luokituksen-lahde-0842']
  };

  if (data.a084 === '') {
    showNotification({componentStyle: 'banner', style: 'alert', text: 'Muu luokitus (084 $a) -arvo ei voi olla tyhjä'});
    return;
  }

  idbGetStoredValues('artoOtherRatings').then(otherRatings => {
    if (otherRatings.some(otherRating => otherRating.a084 === data.a084)) {
      showNotification({componentStyle: 'banner', style: 'alert', text: 'Artikkelille on jo lisätty tämä muu luokitus (084 $a)'});
      return;
    }

    idbAddValueToLastIndex('artoOtherRatings', data).then(() => {
      document.getElementById('lisakentat-muu-luokitus-084a').value = '';
      document.getElementById('lisakentat-luokituksen-lahde-0842').value = '';
      refreshOtherRatingsList();
    });
  });
}

function addOtherTitle(event) {
  event.preventDefault();
  const formJson = formToJson(event);

  const data = {
    value: formJson['artikkelin-muu-nimeke']
  };

  if (data.value === '') {
    showNotification({componentStyle: 'banner', style: 'alert', text: 'Muu nimeke ei voi olla tyhjä'});
    return;
  }

  idbGetStoredValues('artoOtherTitles').then(otherTitles => {
    if (otherTitles.some(otherTitle => otherTitle.value === data.value)) {
      showNotification({componentStyle: 'banner', style: 'alert', text: 'Artikkelille on jo lisätty tämä muu nimeke'});
      return;
    }

    idbAddValueToLastIndex('artoOtherTitles', data).then(() => {
      document.getElementById('artikkelin-muu-nimeke').value = '';
      refreshOtherTitlesList();
    });
  });
}

function addUDK(event) {
  event.preventDefault();
  const formJson = formToJson(event);

  const data = {
    a080: formJson['lisakentat-UDK080a'],
    x080: formJson['lisakentat-UDK080x'],
    two080: formJson['lisakentat-UDK0802']
  };

  if (data.a080 === '') {
    showNotification({componentStyle: 'banner', style: 'alert', text: 'UDK-luokitus (080 $a) -arvo ei voi olla tyhjä'});
    return;
  }

  idbGetStoredValues('artoUDKs').then(udks => {
    if (udks.some(udk => udk.a080 === data.a080)) {
      showNotification({componentStyle: 'banner', style: 'alert', text: 'Artikkelille on jo lisätty tämä UDK-luokitus (080 $a)'});
      return;
    }

    idbAddValueToLastIndex('artoUDKs', data).then(() => {
      document.getElementById('lisakentat-UDK080a').value = '';
      document.getElementById('lisakentat-UDK080x').value = '';
      document.getElementById('lisakentat-UDK0802').value = '';
      refreshUDKsList();
    });
  });
}

function clearNotes(event) {
  event.preventDefault();
  idbClear('artoNotes').then(() => refreshNotesList());
}

function clearOtherRatings(event) {
  event.preventDefault();
  idbClear('artoOtherRatings').then(() => refreshOtherRatingsList());
}

function clearOtherTitles(event) {
  event.preventDefault();
  idbClear('artoOtherTitles').then(() => refreshOtherTitlesList());
}

function clearUDKs(event) {
  event.preventDefault();
  idbClear('artoUDKs').then(() => refreshUDKsList());
}
