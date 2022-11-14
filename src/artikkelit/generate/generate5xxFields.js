export function generatef500(notes = false) {

  if (notes) {
    return notes.map(notes => ({
      tag: '500',
      ind1: ' ',
      ind2: ' ',
      subfields: [{code: 'a', value: notes.value}]
    }));
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
        subfields: [{code: 'a', value: elem.abstract}]
      }
    ]);
  }

  return [];
}

export function generatef567(methodologys) {
  if (methodologys) {
    return methodologys.map(methodology => ({tag: '567', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: `${methodology.value}.`}]}));
  }

  return [];
}

export function generatef591(articleType, articleSciences) {

  return [{tag: '591', ind1: ' ', ind2: ' ', subfields: [{code: 'd', value: articleType}, ...selectArticleSciences(articleSciences), {code: '5', value: 'ARTO'}]}];

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

export function generatef598(localNotesf598 = false) {
  if (localNotesf598) {
    return [{tag: '598', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: localNotesf598}, {code: '5', value: 'ARTO'}]}];
  }

  return [];
}

export function generatef599(f599a, f599x) {
  if (f599a || f599x) {
    return [
      {tag: '599',
        ind1: ' ',
        ind2: ' ',
        subfields: [{code: 'a', value: f599a}, {code: 'x', value: f599x}]}
    ];
  }
  return [];
}
