export function generatef856(referenceLinks = false) {
  if (referenceLinks) {
    return [{tag: '856', ind1: '4', ind2: '0', subfields: [{code: 'u', value: 'text'}]}];
  }

  return [];
}
