export function generateLeader(sourceType) {
  if (sourceType === 'journal') {
    return '00000nab a22000005i 4500';
  }

  if (sourceType === 'book') {
    return '00000naa a22000005i 4500';
  }

  throw new Error('Invalid source type for leader');
}

export function generatef005() {
  return [{tag: '005', value: '00000000000000.0'}];
}

export function generatef007(isElectronic = false) {
  if (isElectronic) {
    return [{tag: '007', value: 'cr||||||||||||'}];
  }

  return [];
}

export function generatef008(year, sourceType, isElectronic, language) {

  function checkLanguage() {

    if (language.iso6392b &&
        (language.iso6392b === 'smi' || language.iso6392b === 'sme' || language.iso6392b === 'smn')) {
      return 'smi';
    }

    if (language.iso6392b && language.iso6392b === 'esp') {
      return 'spa';
    }

    return language.iso6392b;
  }

  const f008Parts = ['000000s', year, selectMaterialType(sourceType, isElectronic), checkLanguage(), ' c'];

  return [{tag: '008', value: f008Parts.join('')}];

  function selectMaterialType(sourceType, isElectronic) {
    if (sourceType === 'book') {
      if (isElectronic) {
        return ' |||| o     ||0 0|';
      }

      return ' ||||       ||0 0|';
    }

    if (sourceType === 'journal') {
      if (isElectronic) {
        return ' || ||o|    |   ||';
      }

      return ' || || |    |   ||';
    }
  }
}
