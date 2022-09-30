import {addValueToSessionStoreList, getSessionStoreValue, resetSessionStoreList} from "/artikkelit/sessionStorageManager.js"
import {idbAddValueToLastIndex, idbGetStoredValues, idbClear} from "/artikkelit/indexDB.js"
import {formToJson, createIconButton, createP, setOptions} from "/common/ui-utils.js";
import {getOntologyWords} from "/common/rest.js";


export function initOntologyWords() {
  console.log('initializing ontology...')
  document.getElementById("asiasana-haku-yso-form").addEventListener("submit", searchOntologyWords);
  document.getElementById("asiasana-lisaa-form").addEventListener("submit", addOntologyWord);

  document.getElementById("tyhjenna-asiasanat-form").addEventListener("submit", clearOntologyWords);

  resetOntologySelect();
  refreshOntologyWordList();
}

export function searchOntologyWords(event) {
  event.preventDefault();
  resetOntologySelect(true);
  const formJson = formToJson(event);
  getOntologyWords(formJson['asiasana-ontologia'], formJson['haku-arvo']).then(data => setOntologyWords(data.results));
}

export function setOntologyWords(words) {
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

export function resetOntologySelect(searching) {
  const select = document.getElementById('asiasana-haku-tulos-lista');
  select.innerHTML = '';

  if (searching) {
    resetSessionStoreList('ontologyTempList');
    return setOptions(select, [{value: '', text: 'Etsitään...'}], true);
  }

  setOptions(select, [{value: '', text: 'Ei tuloksia'}], true);
}


export function addOntologyWord(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  const ontologyWord = getSessionStoreValue('ontologyTempList', formJson['asiasana-haku-tulos-lista']);
  console.log(ontologyWord);

  if (ontologyWord) {
    // idbIndex save
    idbAddValueToLastIndex('artoOntologyWords', ontologyWord).then(() => {
      // refresh ontology word list
      refreshOntologyWordList();
    })
  }
}

export function refreshOntologyWordList() {
  const ontologyWordList = document.getElementById('asiasana-list');
  ontologyWordList.innerHTML = '';

  idbGetStoredValues('artoOntologyWords').then(ontologyWords => {
    ontologyWords.forEach(wordData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('close', ['no-border', 'negative'], `return removeOntologyWord(event, ${wordData.key})`, 'Poista');
      div.appendChild(createP('Asia- tai avainsana', '', '&nbsp;-&nbsp;', ['label-text']));
      const pRelator = createP(wordData.prefLabel);
      pRelator.classList.add('capitalize');
      div.appendChild(pRelator);
      div.appendChild(generateVocabInfo(wordData));
      div.appendChild(createP(wordData.uri, '&nbsp;-&nbsp;', '', ['long-text']));
      div.appendChild(removeButton);
      form.appendChild(div);
      ontologyWordList.appendChild(form);
    });

    if (ontologyWords.length > 1) {
      document.getElementById("tyhjenna-asiasanat-form").style.display = 'block';
    }

    if (ontologyWords.length < 2) {
      document.getElementById("tyhjenna-asiasanat-form").style.display = 'none';
    }
  });

  function generateVocabInfo(word) {
    if (['yso', 'yso-paikat', 'yso-aika'].includes(word.vocab)) {
      return createP(`(${word.vocab}) yso/${word.lang}`, '&nbsp;-&nbsp;');
    }
    return createP(`${word.vocab}/${word.lang}`, '&nbsp;-&nbsp;');
  }
}

export function clearOntologyWords(event) {
  event.preventDefault();
  idbClear('artoOntologyWords').then(() => refreshOntologyWordList());
}
