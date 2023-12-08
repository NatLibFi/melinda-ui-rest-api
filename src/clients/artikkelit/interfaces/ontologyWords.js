import {idbAddValueToLastIndex, idbClear, idbDel, idbGetStoredValues} from '/artikkelit/utils/indexedDB.js';
import {addValueToSessionStoreList, getSessionStoreValue, resetSessionStoreList} from '/artikkelit/utils/sessionStorageManager.js';
import {getOntologyWords} from '/common/rest.js';
import {formToJson, createIconButton, createP, setOptions, showSnackbar} from '/common/ui-utils.js';


export function initOntologyWords() {
  console.log('initializing ontology...');

  document.getElementById('asiasana-lisaa-form').addEventListener('submit', addOntologyWord);
  document.getElementById('tyhjenna-asiasanat-form').addEventListener('submit', clearOntologyWords);
  document.getElementById('asiasana-haku-yso-form').addEventListener('submit', searchOntologyWords);
  document.getElementById('asiasana-ontologia').addEventListener('change', ontologyTypeChange);

  resetOntologySelect();
  refreshOntologyWordList();
}


export function ontologyTypeChange(event) {
  event.preventDefault();
  const ontologyType = event.target.value;

  if ((/other/).test(ontologyType)) {
    document.getElementById('haku-osio').style.display = 'none';
    document.getElementById('asiasana-lisaa-select').style.display = 'none';
    document.getElementById('asiasana-lisaa-input').style.display = 'flex';
    const opts = event.target.options;
    document.getElementById('asiasana-muu-label').innerHTML = `${opts[opts.selectedIndex].text}:`;
    resetOntologySelect();
  } else {
    document.getElementById('haku-osio').style.display = 'flex';
    document.getElementById('asiasana-lisaa-select').style.display = 'flex';
    document.getElementById('asiasana-lisaa-input').style.display = 'none';
    document.getElementById('asiasana-muu-label').innerHTML = '';
    document.getElementById('asiasana-muu').value = '';
  }
}


window.removeOntologyWord = (event, key) => {
  event.preventDefault();
  idbDel('artoOntologyWords', key).then(() => refreshOntologyWordList());
};


function addOntologyWord(event) {
  event.preventDefault();

  const formJson = formToJson(event);
  const ontologyWord = getOntologyWord();
  const ontologyWordOther = getOntologyWordOther();

  if (!ontologyWord && !ontologyWordOther) {
    showSnackbar({style: 'alert', text: 'Asiasana tai avainsana ei voi olla tyhjä'});
    return;
  }

  addOntologyWordToIndexedDb(ontologyWord ?? ontologyWordOther);

  function getOntologyWord() {
    return getSessionStoreValue('ontologyTempList', formJson['asiasana-haku-tulos-lista']);
  }


  function getOntologyWordOther() {
    const select = document.getElementById("asiasana-ontologia");
    const ontologySelectLabel = formJson['asiasana-muu'];
    const ontologySelectValue = select.value;
    const ontologySelectText = select.options[select.selectedIndex].text;

    return {
      prefLabel: ontologySelectLabel,
      vocab: ontologySelectValue,
      text: ontologySelectText
    }
  };


  function addOntologyWordToIndexedDb(newWord) {

    if (duplicate(newWord)) {
      showSnackbar({style: 'alert', text: 'Artikkelille on jo lisätty tämä asia-/avainsana'});
      return;
    }

    idbAddValueToLastIndex('artoOntologyWords', newWord)
      .then(() => {
        resetOntologyOtherInput();
        resetOntologySelect();
        refreshOntologyWordList();
      });

    function duplicate(newWord) {
      idbGetStoredValues('artoOntologyWords')
        .then((words) => {
          return words.some(match);
        })

      function match(word) {
        return newWord.localname
          ? word.localname === newWord.localname
          : word.prefLabel === newWord.prefLabel
      }
    }

  }

  function resetOntologyOtherInput() {
    const otherInputField = document.getElementById('asiasana-muu');
    otherInputField.value = '';
  }

}


function clearOntologyWords(event) {
  event.preventDefault();

  idbClear('artoOntologyWords')
    .then(() => {
      refreshOntologyWordList();
    });
}


function searchOntologyWords(event) {
  event.preventDefault();
  resetOntologySelect(true);
  const formJson = formToJson(event);

  // Added an asterisk (*) after formJson['haku-arvo'] in order to find more matches/options with the search feature
  getOntologyWords(formJson['asiasana-ontologia'], `${formJson['haku-arvo']}*`)
    .then((data) => {
      setOntologyWords(data.results)
    });

  function setOntologyWords(words) {
    if (words.length === 0) {
      return resetOntologySelect();
    }

    const select = document.getElementById('asiasana-haku-tulos-lista');
    const data = words.map((word, index) => {
      const title = `${word.prefLabel}${word.altLabel ? ` (${word.altLabel})` : ''}`;
      addValueToSessionStoreList('ontologyTempList', {identifier: index, ...word});
      return {value: index, text: title};
    });

    setOptions(select, data);
  }

}


function resetOntologySelect(searching) {
  const select = document.getElementById('asiasana-haku-tulos-lista');
  select.innerHTML = '';

  if (searching) {
    resetSessionStoreList('ontologyTempList');
    return setOptions(select, [{value: '', text: 'Etsitään...'}], true);
  }

  setOptions(select, [{value: '', text: 'Ei tuloksia'}], true);
}


export function refreshOntologyWordList() {
  const ontologyWordList = document.getElementById('asiasana-list');
  ontologyWordList.innerHTML = '';

  idbGetStoredValues('artoOntologyWords').then(ontologyWords => {
    ontologyWords.forEach(wordData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('delete_outline', ['alternate-red', 'small'], `return removeOntologyWord(event, ${wordData.key})`, 'Poista');
      div.appendChild(createP('Asia- tai avainsana', '', '&nbsp;-&nbsp;', ['label-text']));
      const pRelator = createP(wordData.prefLabel);
      pRelator.classList.add('capitalize');
      div.appendChild(pRelator);
      div.appendChild(generateVocabInfo(wordData));
      if (!(/other/).test(wordData.vocab)) {
        div.appendChild(createP(wordData.uri, '&nbsp;-&nbsp;', '', ['long-text']));
      }
      div.appendChild(removeButton);
      form.appendChild(div);
      ontologyWordList.appendChild(form);
    });

    if (ontologyWords.length > 1) {
      document.getElementById('tyhjenna-asiasanat-form').style.display = 'block';
    }

    if (ontologyWords.length < 2) {
      document.getElementById('tyhjenna-asiasanat-form').style.display = 'none';
    }
  });

  function generateVocabInfo(word) {
    if (['yso', 'yso-paikat', 'yso-aika'].includes(word.vocab)) {
      return createP(`(${word.vocab}) yso/${word.lang}`, '&nbsp;-&nbsp;');
    }
    if ((/other/).test(word.vocab)) {
      return createP(`${word.text}`, '&nbsp;-&nbsp;');
    }
    return createP(`${word.vocab}/${word.lang}`, '&nbsp;-&nbsp;');
  }

  doUpdate();
}
