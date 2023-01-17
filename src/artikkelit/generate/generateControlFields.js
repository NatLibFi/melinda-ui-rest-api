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

export function generatef008(publYear, sourceType, isElectronic, language) {

  function checkPublYear(publYear) {
    if (!publYear.length || publYear.length !== 4) {
      return '    '; // '^^^^'
    }
    return publYear;
  }


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

  const dateNow = new Date();
  const dateFormatted = dateNow.toISOString().split('T')[0].replace(/-/gu, '').slice(2, 8); // YYMMDD
  const publYear2 = '    '; // 11-14: 'Julkaisuvuosi 2' = 4x space = '^^^^'
  const country = 'fi '; //15-17 'Julkaisu-, tuotanto- tai toteuttamismaa' 'fi^'
  const places18to22 = '|| ||'; // 'Ilmestymistiheys, Säännöllisyys, 20 Määrittelemätön, Jatkuvan julkaisun tyyppi, Alkuperäisen julkaisun ilmiasu', '||^||'
  // place 23 = selectMaterialType:  'Ilmiasu': Painetut artikkelit: tyhjä / Elektroniset artikkelit: o ("Verkkoaineisto")
  const places24to35 = '||||||   ||'; // '||||||^^^||'
  const f008Parts = [dateFormatted, 's', checkPublYear(publYear), publYear2, country, places18to22, selectMaterialType(sourceType, isElectronic), places24to35, checkLanguage(), ' c']; // '^c'

  return [{tag: '008', value: f008Parts.join('')}];

  function selectMaterialType(sourceType, isElectronic) {
    if (sourceType === 'book') {
      if (isElectronic) {
        return 'o';
      }

      return ' '; // '^'
    }

    if (sourceType === 'journal') {
      if (isElectronic) {
        return 'o';
      }

      return ' '; // '^'
    }
  }
}
