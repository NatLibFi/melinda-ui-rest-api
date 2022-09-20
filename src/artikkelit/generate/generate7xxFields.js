export function generatef773(sourceType, articlePages, journal = false, book = false, isbn = false, issn = false) {
  return [
    {
      tag: '773', ind1: '0', ind2: ' ', subfields: [...selectSubfields(sourceType, articlePages, issn, isbn, book, journal)]
    }
  ];

  function selectSubfields(sourceType, articlePages, issn, isbn, {title, publishing}, {journalMelindaId, journalYear, journalNumber, journalVolume = ''}) {
    if (sourceType === 'journal') {
      return [
        {code: 'w', value: journalMelindaId},
        {code: 't', value: title},
        {code: 'd', value: publishing},
        {code: 'x', value: `${issn}. -`},
        ...getSubfieldG(journalVolume, journalYear, journalNumber, articlePages)
      ];
    }

    if (sourceType === 'book') {
      return [
        {code: 'w', value: journalMelindaId},
        {code: 't', value: title},
        {code: 'd', value: publishing},
        ...selectSubfield(isbn, 'z'),
        ...selectSubfield(issn, 'x'),
        {code: 'k', value: journalMelindaId},
        {code: 'g', value: articlePages}
      ];
    }

    return [
      {code: 'z', value: `${isbn}. -`},
      {code: 'g', value: articlePages}
    ];

    function getSubfieldG(journalVolume, journalYear, journalNumber, articlePages) {
      const value = `${journalVolume}(${journalYear}) : ${journalNumber}, s. ${articlePages}`;

      return [{code: 'g', value}];
    }
  }
}

function selectSubfield(value, code = false) {
  if (value) {
    return [{code, value}];
  }

  return [];
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
