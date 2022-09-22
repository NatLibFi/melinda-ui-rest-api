
export function generatef100sf110sf700sf710s(authors = []) {
  if (authors.length === 0) {
    return [];
  }

  const authorFields = authors.map((author, index) => {
    if (index === 1) {
      //  <xsl:when test="$position = 1">
      return generate100or110();
    }

    return generate700or710();

    function generate100or110() {
      //    <xsl:if test="(element[@name='firstName']/values[1]/value[@name='value'] != ' ') or (element[@name='lastName']/values[1]/value[@name='value'] != ' ')">
      //
      //      <xsl:variable name="datafieldTag">
      //        <xsl:choose>
      //          <xsl:when test="element[@name='relator']/values[1]/value[@name='value'] = 'yhteisö'">
      //            <xsl:text>110</xsl:text>
      //          </xsl:when>
      //          <xsl:otherwise>
      //            <xsl:text>100</xsl:text>
      //          </xsl:otherwise>
      //        </xsl:choose>
      //      </xsl:variable>
      //
      //      <xsl:element name="datafield">
      //        <xsl:attribute name="tag">
      //          <xsl:value-of select="$datafieldTag" />
      //        </xsl:attribute>
      //        <xsl:attribute name="ind1">1</xsl:attribute>
      //        <xsl:attribute name="ind2">
      //          <xsl:text></xsl:text>
      //        </xsl:attribute>
      //        <xsl:call-template name="author" />
      //      </xsl:element>
      //
      //    </xsl:if>
      //  </xsl:when>
      return {
        tag: author.relator === 'yhteisö' ? '110' : '100',
        ind1: '1',
        ind2: ' ',
        subfields: generateSubfields()
      };
    }

    function generate700or710() {
      // <xsl:variable name="datafieldTag">
      //  <xsl:choose>
      //   <xsl:when test="element[@name='relator']/values[1]/value[@name='value'] = 'yhteisö'">
      //    <xsl:text>710</xsl:text>
      //   </xsl:when>
      //   <xsl:otherwise>
      //    <xsl:text>700</xsl:text>
      //   </xsl:otherwise>
      //  </xsl:choose>
      // </xsl:variable>
      //
      // <xsl:element name="datafield">
      //  <xsl:attribute name="tag">
      //   <xsl:value-of select="$datafieldTag" />
      //  </xsl:attribute>
      //  <xsl:attribute name="ind1">1</xsl:attribute>
      //  <xsl:attribute name="ind2">
      //   <xsl:text></xsl:text>
      //  </xsl:attribute>
      //  <xsl:call-template name="author" />
      // </xsl:element>
      return {
        tag: author.relator === 'yhteisö' ? '710' : '700',
        ind1: '1',
        ind2: ' ',
        subfields: generateSubfields()
      };
    }

    function generateSubfields() {
      // <xsl:template name="author">
      const subA = {code: 'a', value: `${author.lastName}, ${author.firstName}.`};
      //   <subfield code="a">
      //     <xsl:value-of select="element[@name='lastName']/values[1]/value[@name='value']" />
      //     <xsl:text>, </xsl:text>
      //     <xsl:value-of select="element[@name='firstName']/values[1]/value[@name='value']" />
      //     <xsl:text>.</xsl:text>
      //   </subfield>

      const subE = {code: 'e', value: author.relator};
      //   <subfield code="e">
      //     <xsl:value-of select="element[@name='relator']/values[1]/value[@name='value']" />
      //   </subfield>

      //   <xsl:if test="element[@name='organisation']">
      // eslint-disable-next-line
      const organizations = author.authorsTempOrganizations.map(organization => organization);
      //     <xsl:variable name="organisationNames">
      //       <xsl:for-each select="element[@name='organisation']/values">
      //         <xsl:value-of select="value[@name='label']" />
      //         <xsl:text>;</xsl:text>
      //       </xsl:for-each>
      //     </xsl:variable>

      //     <xsl:variable name="organisationIdentifiers">
      //       <xsl:for-each select="element[@name='organisation']/values">
      //         <xsl:value-of select="value[@name='value']" />
      //         <xsl:text></xsl:text>
      //       </xsl:for-each>
      //     </xsl:variable>

      //     <subfield code="u">
      //       <xsl:value-of select="substring($organisationNames, 1, string-length($organisationNames)-1)" />
      //     </subfield>
      //     <subfield code="g">
      //       (orgn)
      //       <xsl:value-of select="substring($organisationIdentifiers, 1, string-length($organisationIdentifiers)-1)" />
      //     </subfield>

      //   </xsl:if>

      // </xsl:template>

      return [subA, subE];
    }
  });

  return authorFields;
}
