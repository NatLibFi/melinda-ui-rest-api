import {onlyUnique} from './generateUtils';

export function generatef041(articleLanguage, abstractLanguages) {

  const abstractLanguageSubfields = generateAbstractLanguageSubfields(abstractLanguages.filter(onlyUnique));

  function langChecked(lang) {

    if (lang === 'smi') {
      return [{code: 'a', value: 'smi'}, ...abstractLanguageSubfields];
    }

    if (lang === 'sme' || lang === 'smn') {
      return [{code: 'a', value: 'smi'}, {code: 'a', value: articleLanguage}, ...abstractLanguageSubfields];
    }

    if (lang === 'esp') {
      return [{code: 'a', value: 'spa'}, ...abstractLanguageSubfields];
    }

    return [{code: 'a', value: articleLanguage}, ...abstractLanguageSubfields];
  }

  const subfieldA = langChecked(articleLanguage);

  return [
    {
      tag: '041',
      ind1: ' ',
      ind2: ' ',
      subfields: subfieldA
    }
  ];

  function generateAbstractLanguageSubfields(uniqAbstractLanguages) {
    const uniqAbstractLanguagesMapped = uniqAbstractLanguages.map(language => ({code: 'b', value: language}));
    const arraySmi = uniqAbstractLanguagesMapped.filter((element) => element.value === 'smi');
    const arraySmeSne = uniqAbstractLanguagesMapped.filter((element) => element.value === 'sme' || element.value === 'smn');
    const arrayNonSms = uniqAbstractLanguagesMapped.filter((element) => element.value !== 'sme' && element.value !== 'smn' && element.value !== 'smi');
    const arrResult = arrayNonSms;

    function buildNewArray() {
      if (arraySmi.length === 0 && arraySmeSne.length === 0) {
        return arrayNonSms;
      }

      if (arraySmi.length > 0 && arraySmeSne.length === 0) {
        return arrResult.concat(arraySmi);
      }

      if (arraySmi.length > 0 && arraySmeSne.length > 0) {
        return arrResult.concat(arraySmi, arraySmeSne);
      }

      if (arraySmi.length === 0 && arraySmeSne.length > 0) {
        const arraySmi = [{code: 'b', value: 'smi'}];
        return arrResult.concat(arraySmi, arraySmeSne);
      }

      return [];
    }

    const bSubFieldsChecked = buildNewArray();

    const correctedOutput = bSubFieldsChecked.map(item => {
      if (item.value === 'esp') {
        return {...item, value: 'spa'};
      }
      return item;
    });

    return correctedOutput;

  }
}

export function generatef080(udks) {

  if (!udks) {
    return [];
  }

  // may have these subfields: a & x
  const udkResult = udks.map(buildRows);

  function buildRows(element) {
    if (element !== undefined) {
      return {
        tag: '080',
        ind1: ' ',
        ind2: ' ',
        subfields: [
          {code: 'a', value: element.a080},
          {code: 'x', value: element.x080}
        ]
      };
    }
  }

  return udkResult;
}

export function generatef084(otherRatings = false) {
  if (!otherRatings) {
    return [];
  }

  const otherRatingsResult = otherRatings.map(buildRows);

  function buildRows(element) {
    if (element !== undefined) {
      return {
        tag: '084',
        ind1: ' ',
        ind2: ' ',
        subfields: [
          {code: 'a', value: element.a084},
          {code: '2', value: element.two084}
        ]
      };
    }
  }

  return otherRatingsResult;
}
