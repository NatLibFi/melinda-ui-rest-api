export function generatef6xxs(terms) {
  return terms.map(({term, label, uri, subdivision = false}) => {
    if (['termOtherPerson'].includes(term)) {
      return generatef600(label);
    }

    if (['termOtherCommunity'].includes(term)) {
      return generatef610(label);
    }

    if (['termOtherTime'].includes(term)) {
      return generatef648(term, label);
    }

    if (['termYso', 'termAllfo', 'termKassu', 'termSoto', 'termAfo', 'termFinmesh', 'termMaotao'].includes(term)) {
      return generatef650(term, label, uri, subdivision);
    }

    if (['termAllfoGeo', 'termYsoGeo'].includes(term)) {
      return generatef651(term, label, uri, subdivision);
    }

    if (['termOther'].includes(term)) {
      return generatef653(label);
    }

    if (['termSlm', 'termFgf', 'termOtherCategory'].includes(term)) {
      return generatef655(term, label, uri, subdivision);
    }

    throw new Error(`Invalid term! ${term}`);
  });
}

function generatef600(label) {
  return [{tag: '600', ind1: '1', ind2: '4', subfields: [{code: 'a', value: label}]}];
}

function generatef610(label) {
  return [{tag: '610', ind1: '2', ind2: '4', subfields: [{code: 'a', value: label}]}];
}

function generatef648(term, label) {
  return [{tag: '648', ind1: ' ', ind2: '7', subfields: [{code: 'a', value: label}, {code: '2', value: selectSubfield2Value(term, '648')}]}];
}

function generatef650(term, label, uri, subdivision = false) {
  return [
    {
      tag: '650', ind1: ' ', ind2: '7',
      subfields: [
        {code: 'a', value: label},
        ...selectSubfield(subdivision, 'x'),
        {code: '2', value: selectSubfield2Value(term, '650')},
        {code: '0', value: uri}
      ]
    }
  ];
}

function generatef651(term, label, uri, subdivision = false) {
  return [
    {
      tag: '651', ind1: ' ', ind2: '7',
      subfields: [
        {code: 'a', value: label},
        ...selectSubfield(subdivision, 'z'),
        {code: '2', value: selectSubfield2Value(term, '651')},
        {code: '0', value: uri}
      ]
    }
  ];
}

function generatef653(label) {
  return [{tag: '653', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: label}]}];
}

function generatef655(term, label, uri, subdivision = false) {
  if (term === 'termOtherCategory') {
    return [{tag: '655', ind1: ' ', ind2: '4', subfields: [{code: 'a', value: label}]}];
  }

  return [
    {
      tag: '655', ind1: ' ', ind2: '7',
      subfields: [
        {code: 'a', value: label},
        ...selectSubfield(subdivision, 'x'),
        {code: '2', value: selectSubfield2Value(term, '655')},
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

function selectSubfield2Value(term, field) {
  if (term === 'termYso' || term === 'termYsoGeo') {
    return 'yso/fin';
  }

  if (term === 'termAllfo' || term === 'termAllfoGeo') {
    return 'yso/swe';
  }

  if (term === 'termKassu') {
    return 'kassu';
  }

  if (term === 'termSoto') {
    return 'soto';
  }

  if (term === 'termAfo') {
    return 'afo';
  }

  if (term === 'termFinmesh') {
    return 'finmesh';
  }

  if (term === 'termMaotao') {
    return 'maotao';
  }

  if (term === 'termOtherTime') {
    return 'ysa';
  }

  if (term === 'termSlm') {
    return 'slm/fin';
  }

  if (term === 'termFgf') {
    return 'slm/swe';
  }

  throw new Error(`Invalid term value for field ${field}`);
}
