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
