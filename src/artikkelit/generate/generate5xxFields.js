//import {localReducers} from "@natlibfi/melinda-marc-record-merge-reducers/dist/reducers";

export function generatef500(notes = false) {

  if (notes) {
    return notes.map(notes => ({
      tag: '500',
      ind1: ' ',
      ind2: ' ',
      subfields: [{code: 'a', value: notes.value + addDotIfNeeded(notes.value)}]
    }));
  }

  return [];
}

export function generatef506(referenceLinks, isElectronic) {

  if (isElectronic && referenceLinks && referenceLinks[0].length > 0) {
    return [
      {
        tag: '506',
        ind1: '0',
        ind2: ' ',
        subfields: [
          {code: 'a', value: 'Aineisto on vapaasti saatavissa.'},
          {code: 'f', value: 'Unrestricted online access'},
          {code: '2', value: 'star'}
        ]
      }
    ];
  }
  return [];
}

export function generatef520(abstracts) {

  if (abstracts) {
    return abstracts.flatMap(elem => [
      {
        tag: '520',
        ind1: ' ',
        ind2: ' ',
        subfields: [{code: 'a', value: elem.abstract + addDotIfNeeded(elem.abstract)}]
      }
    ]);
  }

  return [];
}

export function generatef540(article) {
  //supported licenses:
  const allowed = ['CC BY 4.0', 'CC BY-NC 4.0', 'CC BY-NC-ND 4.0', 'CC BY-NC-SA 4.0', 'CC BY-ND 4.0', 'CC BY-SA 4.0', 'CC0 1.0', 'Public Domain 1.0'];
  if (!article || !article.ccLicense) {
    return [];
  }

  if (article && article.ccLicense && allowed.includes(article.ccLicense)) {
    return [
      {
        tag: '540',
        ind1: ' ',
        ind2: ' ',
        subfields: [
          {code: 'f', value: article.ccLicense},
          {code: '2', value: 'cc'},
          {code: 'u', value: uField(article)}
        ]
      }
    ];
  }

  return [];

  function uField (article) {

    if (article.ccLicense === 'CC BY 4.0') {
    return 'https://creativecommons.org/licenses/by/4.0/deed.fi';
    }

    if (article.ccLicense === 'CC BY-NC 4.0') {
      return 'https://creativecommons.org/licenses/by-nc/4.0/deed.fi';
    }

    if (article.ccLicense === 'CC BY-NC-ND 4.0') {
      return 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fi';
    }

    if (article.ccLicense === 'CC BY-NC-SA 4.0') {
      return 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fi';
    }

    if (article.ccLicense === 'CC BY-ND 4.0') {
      return 'https://creativecommons.org/licenses/by-nd/4.0/deed.fi';
    }

    if (article.ccLicense === 'CC BY-SA 4.0') {
      return 'https://creativecommons.org/licenses/by-sa/4.0/deed.fi';
    }

    if (article.ccLicense === 'CC0 1.0') {
      return 'https://creativecommons.org/publicdomain/zero/1.0/deed.fi';
    }

    if (article.ccLicense === 'Public Domain 1.0') {
      return 'https://creativecommons.org/publicdomain/mark/1.0/deed.fi';
    }

    return '-';
  }
}

export function generatef567(methodologys) {
  if (methodologys) {
    return methodologys.map(methodology => ({tag: '567', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: `${methodology.value}.`}]}));
  }

  return [];
}

export function generatef591(articleSciences, articleCategory) { // = sciences, article.type

  if (!articleSciences || !articleCategory) {
    return [];
  }

  const codeOfCategory = articleCategory.split(' ', 1);
  return [{tag: '591', ind1: ' ', ind2: ' ', subfields: [{code: 'd', value: codeOfCategory}, ...selectArticleSciences(articleSciences), {code: '5', value: 'ARTO'}]}];

  function selectArticleSciences(articleSciences) {
    return articleSciences.flatMap(science => [{code: 'h', value: science.subject}, {code: 'i', value: science.subCategory}]);
  }
}

export function generatef593(journalJufo, year) {
  //<xsl:if test="($sourceType = 'journal') and set/elements/element[@name='journal']/values[1]/value[@name='jufo'] and (set/elements/element[@name='journalYear']/values[1]/value[@name='value'] >= 2011)">
  //  <datafield tag="593" ind1=" " ind2=" ">
  //    <subfield code="a">
  //      <xsl:value-of select="set/elements/element[@name='journal']/values[1]/value[@name='jufo']" />
  //    </subfield>
  //    <subfield code="5">ARTO</subfield>
  //  </datafield>
  //</xsl:if>

  if (journalJufo && parseInt(year, 10) >= 2011) {
    return [{tag: '593', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: journalJufo}, {code: '5', value: 'ARTO'}]}];
  }

  return [];
}

export function generatef598(f598) {
  // 'collecting' has 'f589a' (!), 'f599a' & 'f599x'. Obviously 'f589a' is just misspelled for 'f598a'

  if (f598) {
    return [{tag: '598', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: f598}, {code: '5', value: 'ARTO'}]}];
  }

  return [];
}

export function generatef599(f599a, f599x) {
  if (f599a || f599x) {
    return [
      {tag: '599',
        ind1: ' ',
        ind2: ' ',
        subfields: [{code: 'a', value: f599a}, {code: 'x', value: f599x}, {code: '5', value: 'ARTO'}]}
    ];
  }
  return [];
}

function addDotIfNeeded(checkThis) {
  const string = checkThis.trim();
  const stringLength = string.length;
  const lastChar = string.charAt(stringLength - 1);
  if (lastChar === '.' || lastChar === '?' || lastChar === '!') {
    return '';
  }
  return '.';
}
