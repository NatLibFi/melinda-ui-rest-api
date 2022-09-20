import {onlyUnique} from './generateUtils';

export function generatef041(articleLanguage, abstractLanguages = []) {
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

export function generatef080() {
  // <xsl:if test="set/groups/group[@name='universal_decimal_classification_number']">
  // <xsl:for-each select="set/groups/group[@name='universal_decimal_classification_number']/values">
  //   <xsl:if test="element[@name='a']">

  //     <datafield tag="080" ind1=" " ind2=" ">

  //       <subfield code="a">
  //         <xsl:value-of select="element[@name='a']/values[1]/value[@name='value']" />
  //       </subfield>

  //       <xsl:if test="element[@name='x']">
  //         <subfield code="x">
  //           <xsl:value-of select="element[@name='x']/values[1]/value[@name='value']" />
  //         </subfield>
  //       </xsl:if>

  //     </datafield>

  //   </xsl:if>
  // </xsl:for-each>
  // </xsl:if>

  return [{tag: '080', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'todo'}, {code: 'b', value: 'todo'}]}];
}

export function generatef084() {
  //   <xsl:if test="set/groups/group[@name='other_classification_number']">
  //   <xsl:for-each select="set/groups/group[@name='other_classification_number']/values">
  //     <xsl:if test="element[@name='a']">

  //       <datafield tag="084" ind1=" " ind2=" ">

  //         <subfield code="a">
  //           <xsl:value-of select="element[@name='a']/values[1]/value[@name='value']" />
  //         </subfield>

  //         <xsl:if test="element[@name='two']">
  //           <subfield code="2">
  //             <xsl:value-of select="element[@name='two']/values[1]/value[@name='value']" />
  //           </subfield>
  //         </xsl:if>

  //       </datafield>

  //     </xsl:if>
  //   </xsl:for-each>
  // </xsl:if>

  return [{tag: '084', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: 'todo'}, {code: '2', value: 'todo'}]}];
}
