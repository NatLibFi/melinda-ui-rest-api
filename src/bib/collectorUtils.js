export function getSubfieldValue(record, fieldTagRegexp, code) {
  return record.get(fieldTagRegexp).flatMap(field => field.subfields.filter(sub => code === sub.code).map(sub => sub.value));
}

export function getSubfieldValues(record, fieldTagRegexp, codes) {
  const fields = record.get(fieldTagRegexp);

  if (fields.length < 1) {
    return [];
  }

  return fields.map(({subfields}) => codes.flatMap(code => subfields.filter(sub => sub.code === code)));
}

export function checkRecordType(wantedType, record) {

  if (!wantedType) {
    return true;
  }

  const {leader} = record;
  const c7 = getIndexOfString(leader, 7);

  if (wantedType === 'journal') {
    return ['s', 'i'].includes(c7);
  }

  if (wantedType === 'book') {
    return c7 === 'm';
  }

  return true;
}

export function getRecordType(record) {
  const {leader} = record;
  const c7 = getIndexOfString(leader, 7);

  if (c7 === 'a') {
    return 'Osakohde monografiassa';
  }

  if (c7 === 'b') {
    return 'Osakohde kausijulkaisussa';
  }

  if (c7 === 'c') {
    return 'Kokoelma';
  }

  if (c7 === 'd') {
    return 'Osakohde kokoelmassa';
  }

  if (c7 === 's') {
    return 'Kausijulkaisu';
  }

  if (c7 === 'i') {
    return 'Päivittyvä julkaisu';
  }

  if (c7 === 'm') {
    return 'Monografia';
  }

  return false;
}

export function getSourceType(record) {
  const {leader} = record;
  const c6 = getIndexOfString(leader, 6);
  const c7 = getIndexOfString(leader, 7);

  return `nn${c6}${c7}`;
}

export function getIsElectronic(record) {
  const [f008] = record.get(/008/u);
  const c23 = getIndexOfString(f008.value, 23);
  return c23 === 's' || c23 === 'q' || c23 === 'o';
}

function getIndexOfString(string, wantedIndex) {
  const [char] = [...string].filter((_, index) => index === wantedIndex);
  return char;
}
