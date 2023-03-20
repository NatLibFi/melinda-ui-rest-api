export function generatef6xxs(terms) {

  if (!terms) {
    return [];
  }

  const f600s = terms.filter(({vocab}) => vocab === 'otherPerson');
  const f610s = terms.filter(({vocab}) => vocab === 'otherCommunity');
  const f648s = terms.filter(({vocab}) => ['yso-aika', 'otherCommunity'].includes(vocab));
  const sortedF648s = sortFields(f648s, ['yso-aika', 'otherCommunity'], ['fi', 'sv']);
  const f650s = terms.filter(({vocab}) => ['yso', 'kassu', 'soto', 'afo', 'finmesh', 'maotao'].includes(vocab));
  const sortedF650s = sortFields(f650s, ['yso', 'kassu', 'soto', 'afo', 'finmesh', 'maotao'], ['fi', 'sv']);
  const f651s = terms.filter(({vocab}) => ['yso-paikat'].includes(vocab));
  const sortedF651s = sortFields(f651s, ['yso-paikat'], ['fi', 'sv']);
  const f653s = terms.filter(({vocab}) => vocab === 'other');
  const f655s = terms.filter(({vocab}) => ['slm', 'otherCategory'].includes(vocab));
  const sortedF655s = sortFields(f655s, ['slm', 'otherCategory'], ['fi', 'sv']);

  const sortedTerms = [
    ...f600s,
    ...f610s,
    ...sortedF648s,
    ...sortedF650s,
    ...sortedF651s,
    ...f653s,
    ...sortedF655s
  ];

  return sortedTerms.flatMap(({vocab, prefLabel, lang, uri, subdivision = false}) => {
    if (['otherPerson'].includes(vocab)) {
      return generatef600(prefLabel);
    }

    if (['otherCommunity'].includes(vocab)) {
      return generatef610(prefLabel);
    }

    if (['otherTime', 'yso-aika'].includes(vocab)) {
      return generatef648(vocab, prefLabel, lang, uri);
    }

    if (['yso', 'kassu', 'soto', 'afo', 'finmesh', 'maotao'].includes(vocab)) {
      return generatef650(vocab, prefLabel, lang, uri, subdivision);
    }

    if (['yso-paikat'].includes(vocab)) {
      return generatef651(vocab, prefLabel, lang, uri, subdivision);
    }

    if (['other'].includes(vocab)) {
      return generatef653(prefLabel);
    }

    if (['slm', 'otherCategory'].includes(vocab)) {
      return generatef655(vocab, prefLabel, lang, uri, subdivision);
    }

    throw new Error(`Invalid vocab! ${vocab}`);
  });
}

function generatef600(prefLabel) {
  return [{tag: '600', ind1: '1', ind2: '4', subfields: [{code: 'a', value: prefLabel}]}];
}

function generatef610(prefLabel) {
  return [{tag: '610', ind1: '2', ind2: '4', subfields: [{code: 'a', value: prefLabel}]}];
}

function generatef648(vocab, prefLabel, lang, uri) {
  return [
    {
      tag: '648', ind1: ' ', ind2: '7',
      subfields: [
        {code: 'a', value: prefLabel},
        {code: '2', value: generateSubfield2Value(vocab, convertLangs(lang))},
        ...generateSubfield0()
      ]
    }
  ];

  function generateSubfield0() {
    if (vocab === 'yso-aika') {
      return [{code: '0', value: uri}];
    }

    return [];
  }

}

function generatef650(vocab, prefLabel, lang, uri, subdivision = false) {
  return [
    {
      tag: '650', ind1: ' ', ind2: '7',
      subfields: [
        {code: 'a', value: prefLabel},
        ...selectSubfield(subdivision, 'x'),
        {code: '2', value: generateSubfield2Value(vocab, convertLangs(lang))},
        {code: '0', value: uri}
      ]
    }
  ];
}

function generatef651(vocab, prefLabel, lang, uri, subdivision = false) {
  return [
    {
      tag: '651', ind1: ' ', ind2: '7',
      subfields: [
        {code: 'a', value: prefLabel},
        ...selectSubfield(subdivision, 'z'),
        {code: '2', value: generateSubfield2Value(vocab, convertLangs(lang))},
        {code: '0', value: uri}
      ]
    }
  ];
}

function generatef653(prefLabel) {
  return [{tag: '653', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: prefLabel}]}];
}

function generatef655(vocab, prefLabel, lang, uri, subdivision = false) {
  if (vocab === 'otherCategory') {
    return [{tag: '655', ind1: ' ', ind2: '4', subfields: [{code: 'a', value: prefLabel}]}];
  }

  return [
    {
      tag: '655', ind1: ' ', ind2: '7',
      subfields: [
        {code: 'a', value: prefLabel},
        ...selectSubfield(subdivision, 'x'),
        {code: '2', value: generateSubfield2Value(vocab, convertLangs(lang))},
        {code: '0', value: uri}
      ]
    }
  ];
}

function selectSubfield(subdivision, code = false) {
  if (subdivision) {
    return [{code, value: subdivision}];
  }

  return [];
}

function generateSubfield2Value(vocab, lang) {
  if (vocab === 'yso' || vocab === 'yso-paikat' || vocab === 'yso-aika') {
    return `yso/${lang}`;
  }

  if (vocab === 'kassu') {
    return 'kassu';
  }

  if (vocab === 'soto') {
    return 'soto';
  }

  if (vocab === 'afo') {
    return 'afo';
  }

  if (vocab === 'finmesh') {
    return 'finmesh';
  }

  if (vocab === 'maotao') {
    return 'maotao';
  }

  if (vocab === 'otherTime') {
    return 'ysa';
  }

  if (vocab === 'slm' || vocab === 'fgf') {
    return `slm/${lang}`;
  }

  throw new Error(`Invalid vocab info!`);
}

function sortFields(ontologyWordDatas, vocabOrder = [], langOrder = false) {
  const ontologyWordDataOrderedByVocab = vocabOrder.map(vocab => ontologyWordDatas.filter(ontologyWordData => ontologyWordData.vocab === vocab));
  if (langOrder) {
    return ontologyWordDataOrderedByVocab.flatMap(ontologyVocabList => langOrder.flatMap(lang => ontologyVocabList.filter(ontologyWordData => ontologyWordData.lang === lang)));
  }

  return ontologyWordDataOrderedByVocab.flatMap(ontologyVocabList => ontologyVocabList);
}

function convertLangs(langCode) {
  if (langCode === 'fi') {
    return 'fin';
  }

  if (langCode === 'sv') {
    return 'swe';
  }

  return langCode;
}
