export function generatef336() {
  return [{tag: '336', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'text'}, {code: 'b', value: 'txt'}, {code: '2', value: 'rdacontent'}]}];
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

export function generatef380(bookReview) {
  if (bookReview) {
    return [{tag: '380', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'kirja-arvostelu'}, {code: '0', value: 'http://urn.fi/URN:NBN:fi:au:mts:m2187'}]}];
  }

  return [];
}
