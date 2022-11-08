
export function generatef245(articleTitle, authors) {

  if (articleTitle) {
    return [
      {tag: '245',
        ind1: ind1Value(),
        ind2: '0',
        subfields: [{code: 'a', value: `${articleTitle}.`}]}
    ];
  }

  return [];

  function ind1Value () {
    if (authors.length === 0) {
      return '0';
    }
    return '1';
  }

}

export function generatef246(otherTitle = false) {
  //<xsl:if test="set/elements/element[@name='title_other']">
  // <datafield tag="246" ind1="3" ind2=" ">
  //  <subfield code="a">
  //   <xsl:value-of select="set/elements/element[@name='title_other']/values[1]/value" />
  //  </subfield>
  // </datafield>
  //</xsl:if>
  if (otherTitle) {
    return [{tag: '246', ind1: '3', ind2: '0', subfields: [{code: 'a', value: `${otherTitle}`}]}];
  }

  return [];
}
