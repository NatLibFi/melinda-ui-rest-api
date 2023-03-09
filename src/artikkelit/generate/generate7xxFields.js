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

    return [
      {code: 'z', value: `${isbn}. -`},
      {code: 'g', value: pages}
    ];

    function getSubfieldG() {
      const value = `${volume} (${publishingYear})${printNumber(number)}${printPages(pages)}`;

      return [{code: 'g', value}];

      function printNumber(number) {
        if (number) {
          return `: ${number}`;
        }
        return '';
      }

      function printPages(pages) {
        if (pages) {

          if (!Number.isNaN(Number(pages))) {
            return `, sivu ${pages}`;
          }

          if (Number.isNaN(Number(pages))) { // special case (newspapers): when input type is 'A7'
            const first = pages.trim().split(/[0-9]/u);
            const rest = pages.trim().split(/[a-zA-Z]/u);
            const testA = (/[a-zA-Z]/u).test(first[0]);
            const testB = (/[0-9]/u).test(rest[1]);

            if (testA && testB) {
              return `, sivu ${pages}`;
            }
          }
          return `, sivut ${pages}`;
        }
        return '';
      }
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
