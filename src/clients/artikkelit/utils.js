export function getOntologyOptions(ontology) {
  const sweOntologies = ['allfo', 'allfoOrter', 'allfoTid', 'fgf'];
  const localOntologies = ['other', 'otherPerson', 'otherCommunity', 'otherTime'];

  const vocabularies = {
    yso: 'yso',
    allfo: 'yso',
    ysoPaikat: 'yso-paikat',
    allfoOrter: 'yso-paikat',
    ysoAika: 'yso-aika',
    allfoTid: 'yso-aika',
    slm: 'slm',
    fgf: 'slm',
    kassu: 'kassu',
    afo: 'afo',
    maotao: 'maotao',
    koko: 'koko',
    kanto: 'finaf',
    finmesh: 'mesh'
  };

  const searchVocab = vocabularies[ontology];
  const language = sweOntologies.includes(ontology) ? 'sv' : 'fi';

  if (localOntologies.includes(ontology)) {
    return {
      searchVocab: 'local',
      language
    };
  }

  return {
    searchVocab,
    language
  };
}

// Helper function for sorting search result selects.
//---------------------------------------------------------------
// Returns record data sorted by the record's text.
// Search string and record data are given as parameters
// The records are first sorted into two groups
//    - records that have text which starts with searchString
//    - all the rest
// The two two groups are then both sorted alphabetically.
// Finally, sorted array is formed 
// with the records that start with the search string as first, 
// and the rest after those.
export function sortRecordData(searchString, data) {

  if (data === undefined || data.length === 0) {
    console.log('No record data to sort');
    return;
  }

  const startsWith = [];
  const rest = [];

  data.forEach(record => {

    if (record.text.toLowerCase().startsWith(searchString.toLowerCase()) && searchString !== undefined && searchString !== '') {
      startsWith.push(record);
      return;
    }

    rest.push(record);
  })

  console.log('startsWith: ', startsWith)
  console.log('rest: ', rest)

  const sortedRecordData = startsWith.sort(compareRecordTitles).concat(rest.sort(compareRecordTitles));
  return sortedRecordData;

  function compareRecordTitles(recordA, recordB) {
    return recordA.text.localeCompare(recordB.text);
  }
}
