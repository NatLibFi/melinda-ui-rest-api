import {createFintoOperator} from './fintoOperator';

export function createOntologyService(fintoUrl) {

  const fintoOperator = createFintoOperator(fintoUrl);

  return {getOntologyData};

  async function getOntologyData(language, ontology, query) {
    const result = await fintoOperator.queryOntologies(ontology, language, query);
    return result;
  }
}
