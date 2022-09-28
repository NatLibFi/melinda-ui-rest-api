
export function generatef245(articleTitle = false) {
  //   <xsl:element name="datafield">
  //   <xsl:attribute name="tag">245</xsl:attribute>
  //   <xsl:attribute name="ind1">

  //     <xsl:choose>
  //       <xsl:when test="set/groups/group[@name='author']">
  //         <xsl:text>1</xsl:text>
  //       </xsl:when>
  //       <xsl:otherwise>
  //         <xsl:text>0</xsl:text>
  //       </xsl:otherwise>
  //     </xsl:choose>

  //   </xsl:attribute>
  //   <xsl:attribute name="ind2">
  //     <xsl:text>0</xsl:text>
  //   </xsl:attribute>
  //   <subfield code="a">
  //     <xsl:choose>
  //       <xsl:when test="$sourceType = 'journal'">
  //         <xsl:value-of select="set/elements/element[@name='articleTitle_journal']/values[1]/value[@name='value']" />
  //         <xsl:text>.</xsl:text>
  //       </xsl:when>
  //       <xsl:otherwise>
  //         <xsl:value-of select="set/elements/element[@name='articleTitle_book']/values[1]/value[@name='value']" />
  //         <xsl:text>.</xsl:text>
  //       </xsl:otherwise>
  //     </xsl:choose>
  //   </subfield>
  // </xsl:element>

  if (articleTitle) {
    return [{tag: '245', ind1: '?', ind2: '0', subfields: [{code: 'a', value: `${articleTitle}`}]}];
  }

  return [];
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
    return [{tag: '246', ind1: '3', ind2: ' ', subfields: [{code: 'a', value: `${otherTitle}`}]}];
  }

  return [];
}
