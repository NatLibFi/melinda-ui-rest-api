export function generatef336() {
  return [{tag: '336', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'teksti'}, {code: 'b', value: 'txt'}, {code: '2', value: 'rdacontent'}]}];
}

export function generatef337(isElectronic) {
  return [{tag: '337', ind1: ' ', ind2: ' ', subfields: [...selectSubfields(isElectronic)]}];

  function selectSubfields(isElectronic) {
    if (isElectronic) {
      return [{code: 'a', value: 'tietokonekäyttöinen'}, {code: 'b', value: 'c'}, {code: '2', value: 'rdamedia'}];

    }

    return [{code: 'a', value: 'käytettävissä ilman laitetta'}, {code: 'b', value: 'n'}, {code: '2', value: 'rdamedia'}];
  }
}

// "teatteriarvostelu", "sirkusarvostelu", "elokuva-arvostelu", "tanssiarvostelu", "musiikkiarvostelu" tai "taidearvostelu"
export function generatef380(reviewType = false) {
  if (!reviewType) {
    return [];
  }

  if (reviewType === 'kirja-arvostelu') {
    return [{tag: '380', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'kirja-arvostelu'}, {code: '0', value: 'http://urn.fi/URN:NBN:fi:au:mts:m2187'}]}];
  }

  if (reviewType === 'teatteriarvostelu') {
    return [{tag: '380', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'teatteriarvostelu'}, {code: '0', value: 'http://urn.fi/URN:NBN:fi:au:mts:m2180'}]}];
  }

  if (reviewType === 'sirkusarvostelu') {
    return [{tag: '380', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'sirkusarvostelu'}, {code: '0', value: 'http://urn.fi/URN:NBN:fi:au:mts:m2182'}]}];
  }

  if (reviewType === 'elokuva-arvostelu') {
    return [{tag: '380', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'elokuva-arvostelu'}, {code: '0', value: 'http://urn.fi/URN:NBN:fi:au:mts:m2183'}]}];
  }

  if (reviewType === 'tanssiarvostelu') {
    return [{tag: '380', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'tanssiarvostelu'}, {code: '0', value: 'http://urn.fi/URN:NBN:fi:au:mts:m2184'}]}];
  }

  if (reviewType === 'musiikkiarvostelu') {
    return [{tag: '380', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'musiikkiarvostelu'}, {code: '0', value: 'http://urn.fi/URN:NBN:fi:au:mts:m2185'}]}];
  }

  if (reviewType === 'taidearvostelu') {
    return [{tag: '380', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'taidearvostelu'}, {code: '0', value: 'http://urn.fi/URN:NBN:fi:au:mts:m2186'}]}];
  }

  return [];
}
