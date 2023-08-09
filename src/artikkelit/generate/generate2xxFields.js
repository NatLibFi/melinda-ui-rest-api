
export function generatef245(articleTitle, authors, artLang) {

  if (!articleTitle) {
    return [];
  }

  if (articleTitle) {
    return [
      {tag: '245',
        ind1: ind1Value(),
        ind2: ind2Value(),
        subfields: [{code: 'a', value: articleTitle + addDotIfNeeded(articleTitle)}]}
    ];
  }

  return [];

function ind1Value () {

if (authors.length === 0) {
  return '0';
}

const listYkktRelators = authors.filter((element) => element.relator === 'yhteisö' || element.relator === 'kuvittaja' || element.relator === 'kääntäjä' || element.relator === 'toimittaja');
const listKirjoittajaRelators = authors.filter((element) => element.relator === 'kirjoittaja');

if (authors.length === 1 && authors[0].relator === 'yhteisö') {
  return '1' ;
}

if (authors[0].relator === 'yhteisö') {
  return '1' ;
}

if (listYkktRelators.length > 0 && listKirjoittajaRelators.length === 0) {
  return '0' ;
}

if (listYkktRelators.length > 0 && listKirjoittajaRelators.length > 0) {
  return '1' ;
}

return '1';
}

  function ind2Value () {

    if (articleTitle && artLang === 'eng') {
      const titleSplitted = articleTitle.split(' ');
      const [firstWord] = titleSplitted;

      if (firstWord === 'A') {
        return '2';
      }

      if (firstWord === 'An') {
        return '3';
      }

      if (firstWord === 'The') {
        return '4';
      }

    }
    return '0';
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
