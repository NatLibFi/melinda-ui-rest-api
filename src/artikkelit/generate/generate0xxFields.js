import {onlyUnique} from './generateUtils';

export function generatef041(articleLanguage, abstractLanguages) {
  const abstractLanguageSubfields = generateAbstractLanguageSubfields(abstractLanguages.filter(onlyUnique));

  return [
    {
      tag: '041',
      ind1: ' ',
      ind2: ' ',
      subfields: [{code: 'a', value: articleLanguage}, ...abstractLanguageSubfields]
    }
  ];

  function generateAbstractLanguageSubfields(uniqAbstractLanguages) {
    return uniqAbstractLanguages.map(language => ({code: 'b', value: language}));
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
