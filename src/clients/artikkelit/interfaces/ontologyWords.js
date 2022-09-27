import {setOptions} from "/artikkelit/utils.js"
import {idbAddValueToLastIndex, idbGetStoredValues} from "/artikkelit/indexDB.js"

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
      form.classList.add('full-width');
      const removeButton = createIconButton('close', ['no-border'], `return removeOntologyWord(event, ${wordData.key})`, 'Poista');
      form.appendChild(removeButton);
      const pRelator = createP(wordData.prefLabel);
      pRelator.classList.add('capitalize');
      form.appendChild(pRelator);
      form.appendChild(generateVocabInfo(wordData));
      form.appendChild(createP(wordData.uri, '&nbsp;-&nbsp;'));
      ontologyWordList.appendChild(form);
    });
  });

  function generateVocabInfo(word) {
    if (['yso', 'yso-paikat', 'yso-aika'].includes(word.vocab)) {
      return createP(`(${word.vocab}) yso/${word.lang}`, '&nbsp;-&nbsp;');
    }
    return createP(`${word.vocab}/${word.lang}`, '&nbsp;-&nbsp;');
  }
}