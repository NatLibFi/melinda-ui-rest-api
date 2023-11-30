import {idbAddValueToLastIndex, idbGetStoredValues, idbClear} from '/artikkelit/indexDB.js';
import {formToJson, createIconButton, createP, showNotificationBanner} from '/common/ui-utils.js';

export function initAbstracts() {
  console.log('initializing abstracts...');
  document.getElementById('tiivistelma-lisaa-form').addEventListener('submit', addAbstract);

  document.getElementById('tyhjenna-tiivistelmat-form').addEventListener('submit', clearAbstracts);

  document.getElementById('tiivistelma-abstrakti').addEventListener('input', characterCounter);

  document.getElementById('tiivistelma-lisaa-form').addEventListener('reset', resetCharacterCounter);

  refreshAbstractList();
}

export function addAbstract(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  const [iso6391, iso6392b, ui] = formJson['tiivistelma-kieli'].split(';');

  const data = {
    language: {iso6391, iso6392b, ui},
    abstract: formJson['tiivistelma-abstrakti']
  };

  if (data.abstract === '') {
    showNotificationBanner({style: 'alert', text: 'Tiivistelmä ei voi olla tyhjä'});
    return;
  }

  idbGetStoredValues('artoAbstracts').then(abstracts => {
    if (abstracts.some(abs => abs.abstract === data.abstract)) {
      showNotificationBanner({style: 'alert', text: 'Tiivistelmä ei voi olla identtinen aiemmin lisätyn tiivistelmän kanssa'});
      return;
    }

    idbAddValueToLastIndex('artoAbstracts', data).then(() => {
      document.getElementById('tiivistelma-lisaa-form').reset();
      refreshAbstractList();
    });
  });
}

export function refreshAbstractList() {
  const abstractsList = document.getElementById('tiivistelmat-list');
  abstractsList.innerHTML = '';

  idbGetStoredValues('artoAbstracts').then(abstracts => {
    abstracts.forEach(abstractData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('delete_outline', ['alternate-red', 'small'], `return removeAbstract(event, ${abstractData.key})`, 'Poista');
      div.appendChild(createP(abstractData.language.ui, '', '&nbsp;-&nbsp;', ['label-text']));
      const abstractP = createP(abstractData.abstract);
      abstractP.classList.add('long-text');
      abstractP.setAttribute('lang', abstractData.language.iso6391);
      div.appendChild(abstractP);
      div.appendChild(removeButton);
      form.appendChild(div);
      abstractsList.appendChild(form);
    });

    if (abstracts.length > 1) {
      document.getElementById('tyhjenna-tiivistelmat-form').style.display = 'block';
    }

    if (abstracts.length < 2) {
      document.getElementById('tyhjenna-tiivistelmat-form').style.display = 'none';
    }
  });

  doUpdate();
}

export function clearAbstracts(event) {
  event.preventDefault();
  idbClear('artoAbstracts').then(() => refreshAbstractList());
}

export function characterCounter(event) {
  const maxLength = 2000;
  const currentLength = event.target.value.length || 0;
  document.getElementById('tiivistelma-merkkiraja').innerHTML = `${currentLength}/${maxLength}`;
  const warning = document.getElementById('tiivistelma-merkkirajan-ylitys');
  if (currentLength > maxLength) {
    const overLimitText = event.target.value.slice(maxLength);
    warning.innerHTML = `<strong>HUOM!</strong> Tiivistelmän merkkiraja on ylittynyt.<br><br>
                          Voit jatkaa kirjoittamista ja lisätä tiivistelmän, mutta rajan ylittävä osuus katkaistaan ennen tallennusta Melindaan.<br><br>
                          Rajan ylittävä osuus: ${overLimitText}`;
    warning.style.padding = '4px 14px';
  } else {
    warning.innerHTML = '';
    warning.style.padding = '';
  }
}

export function resetCharacterCounter(event) {
  document.getElementById('tiivistelma-merkkiraja').innerHTML = '0/2000';
  const warning = document.getElementById('tiivistelma-merkkirajan-ylitys');
  warning.innerHTML = '';
  warning.style.padding = '';
}
