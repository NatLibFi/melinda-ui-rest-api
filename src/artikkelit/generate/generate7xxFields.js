export function generatef773(sourceType, {publishingYear, volume, number, pages}, melindaId, publishing, isbn, issn, SourceTypeAsCode, titleFor773t) {
  
  return [
    {
      tag: '773', ind1: '0', ind2: ' ', subfields: [...selectSubfields()]
    }
  ];

  function selectSubfields() {
    if (sourceType === 'journal') {
      return [
        {code: '7', value: SourceTypeAsCode},
        {code: 'w', value: melindaId},
        {code: 't', value: `${titleFor773t}. -`},
        {code: 'd', value: publishing},
        {code: 'x', value: `${issn}. -`},
        ...getSubfieldG(volume, publishingYear, number, pages)
      ];
    }

    if (sourceType === 'book') {
      return [
        {code: '7', value: SourceTypeAsCode},
        {code: 'w', value: melindaId},
        {code: 't', value: titleFor773t},
        {code: 'd', value: publishing},
        ...selectSubfield(isbn, 'z'),
        ...selectSubfield(issn, 'x'),
        {code: 'k', value: melindaId},
        {code: 'g', value: pages}
      ];
    }

    if (isbn && pages) {
      return [
        {code: 'z', value: `${isbn}. -`},
        {code: 'g', value: pages}
      ];
    }      
    
    return [];

    function getSubfieldG() {
      const value = `${volume} (${publishingYear}) : ${number}, sivut ${pages}`;
      return [{code: 'g', value}];
    }
  }

  function selectSubfield(value, code = false) {
    if (value) {
      return [{code, value}];
    }

    return [];
  }
}


export function generatef787(reviewBooks = false) {
  if (reviewBooks) {
    return reviewBooks.map(book => [
      {
        tag: '787', ind1: '0', ind2: '8',
        subfields: [
          {code: 'i', value: 'Arvosteltu teos:'},
          {code: 't', value: `${book.title} ${book.details}`},
          {code: 'd', value: book.publishing},
          {code: 'z', value: `${book.isbn}. -`},
          {code: 'w', value: `(FI-MELINDA)${book.melindaId}`}
        ]
      }
    ]);
  }

  return [];
}
