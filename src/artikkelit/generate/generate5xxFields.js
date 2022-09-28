export function generatef500(notes = false) {
  //<xsl:for-each select="set/elements/element[@name='note_general']/values">
  //  <datafield tag="500" ind1=" " ind2=" ">
  //    <subfield code="a">
  //      <xsl:value-of select="value" />
  //    </subfield>
  //  </datafield>
  //</xsl:for-each>
  //<xsl:variable name="articleType">
  //<xsl:choose>
  //  <xsl:when test="set/elements/element[@name='articleType_journal']">
  //    <xsl:value-of select="set/elements/element[@name='articleType_journal']/values[1]/value[@name='value']" />
  //  </xsl:when>
  //  <xsl:otherwise>
  //    <xsl:value-of select="set/elements/element[@name='articleType_book']/values[1]/value[@name='value']" />
  //  </xsl:otherwise>
  //</xsl:choose>
  //</xsl:variable>
  if (notes) {
    return notes.map(notes => ({
      tag: '500', ind1: ' ', ind2: ' ',
      subfields: [{code: 'a', value: notes.value}]
    }));
  }

  return [];
}

export function generatef520(abstracts) {
  //<xsl:if test="set/groups/group[@name='abstract']/values">
  //  <xsl:for-each select="set/groups/group[@name='abstract']/values">
  //    <datafield tag="520" ind1=" " ind2=" ">
  //      <subfield code="a">
  //        <xsl:value-of select="element[@name='term']/values[1]/value[@name='value']" />
  //        <xsl:text>.</xsl:text>
  //      </subfield>
  //    </datafield>
  //  </xsl:for-each>
  //</xsl:if>
  if (abstracts) {
    return abstracts.flatMap(abstract => [{tag: '520', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: abstract}]}]);
  }

  return [];
}

export function generatef567(methodologys) {
  if (methodologys) {
    return methodologys.map(methodology => ({tag: '567', ind1: ' ', ind2: ' ', subfields: [{code: 'a', value: methodology}]}));
  }

  return [];
}

export function generatef591(articleType, articleSciences) {
  return [{tag: '591', ind1: ' ', ind2: ' ', subfields: [{code: 'd', value: articleType}, ...selectArticleSciences(articleSciences)]}];

  function selectArticleSciences(articleSciences) {
    return articleSciences.flatMap(science => [{code: 'h', value: science.label}, {code: 'i', value: science.value}]);
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

export function generatef599(localNotesf599 = false) {
  //<xsl:if test="set/groups/group[@name='local_notes_599']">
  //  <xsl:for-each select="set/groups/group[@name='local_notes_599']/values">
  //    <xsl:if test="element[@name='a']">
  //      <datafield tag="599" ind1=" " ind2=" ">
  //        <subfield code="a">
  //          <xsl:value-of select="element[@name='a']/values[1]/value[@name='value']" />
  //        </subfield>
  //        <xsl:if test="element[@name='x']">
  //          <subfield code="x">
  //            <xsl:value-of select="element[@name='x']/values[1]/value[@name='value']" />
  //          </subfield>
  //        </xsl:if>
  //        <subfield code="5">ARTO</subfield>
  //      </datafield>
  //    </xsl:if>
  //  </xsl:for-each>
  //</xsl:if>
  if (localNotesf599) {
    return localNotesf599.flatMap(notes => ({
      tag: 599, ind1: ' ', ind2: ' ',
      subfields: [{code: 'a', value: notes.a}, ...selectNotesX(notes)]
    }));
  }

  return [];

  function selectNotesX(notes) {
    if (notes.x !== undefined) {
      return [{code: 'x', value: notes.x}];
    }

    return [];
  }
}
