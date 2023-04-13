export function generatef856(referenceLinks, isElectronic) {
    
  function ind2value(isElectronic) {
    if (isElectronic === false) { // printed
      return '1';
    }
    return '0'; // electronic
  }

  if (referenceLinks && referenceLinks.length > 0 && referenceLinks[0].length > 0) {
 
    return referenceLinks.map(link  => ({
      tag: '856',
      ind1: '4',
      ind2: ind2value(isElectronic),
      subfields: [{code: 'u', value: link }, {code: 'y', value: 'Linkki verkkoaineistoon'}]
    }));
  }

  return [];
}
