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
