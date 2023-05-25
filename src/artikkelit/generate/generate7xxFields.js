export function generatef773(sourceType, {publishingYear, volume, number, pages}, melindaId, isbn, issn, SourceTypeAsCode, titleFor773t) {

  return [
    {
      tag: '773', ind1: '0', ind2: '8', subfields: [...selectSubfields()]
    }
  ];

  function selectSubfields() {
    if (sourceType === 'journal') {
      return [
        {code: 'i', value: `Sisältyy manifestaatioon:`},
        {code: 't', value: `${titleFor773t}.`},
        ...getSubfieldGfoJournal(volume, publishingYear, number, pages),
        {code: 'x', value: `${issn}`},
        {code: 'w', value: melindaId},
        {code: '7', value: SourceTypeAsCode}
      ];
    }

    if (sourceType === 'book') {
      return [
        {code: 'i', value: `Sisältyy manifestaatioon:`},
        {code: 't', value: `${titleFor773t}.`},
        ...getSubfieldGfoBook(),
        ...checkThisSubfield(isbn, 'z'),
        {code: 'w', value: melindaId},
        {code: '7', value: SourceTypeAsCode}
      ];
    }

    return [
      ...checkThisSubfield(isbn, 'z'),
      {code: 'g', value: pages ? pages : ' '}
    ];

    function getSubfieldGfoBook() {
      if (pages.trim().length > 0) {
        return [{code: 'g', value: printPages(pages)}];
      }

      return '';
    }

    function getSubfieldGfoJournal() {

      const gvalue = `${printVolume(volume)} (${printPublishingYear(publishingYear)})${printNumber(number)}${printPages(pages)}`;

      return [{code: 'g', value: gvalue}];

      function printVolume(volume) {
        if (volume) {
          return volume;
        }
        return '';
      }

      function printPublishingYear(publishingYear) {
        if (publishingYear) {
          return publishingYear;
        }
        return '';
      }


      function printNumber(number) {
        if (number) {
          return `: ${number}`;
        }
        return '';
      }
    }

  }

  function printPages(pages) {
    if (pages) {
      if (!Number.isNaN(Number(pages))) {
        if (sourceType === 'journal') {
          return `, sivu ${pages}`;
        }
        if (sourceType === 'book') {
          return `Sivu ${pages}`;
        }
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

      if (sourceType === 'journal') {
        return `, sivut ${pages}`;
      }
      if (sourceType === 'book') {
        return `Sivut ${pages}`;
      }

    }
    return '';
  }

  function checkThisSubfield(value, code = false) {
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
