import {Error as FintoError} from '@natlibfi/melinda-commons';
import fetch from 'node-fetch';

export function createFintoOperator(fintoUrl) {

  return {queryOntologies};

  function queryOntologies(ontology, language, query) {
    const searchUrl = `${fintoUrl}?vocab=${ontology}&lang=${language}&query=${query}`;
    // console.log(searchUrl); // eslint-disable-line
    return fetch(searchUrl, {method: 'GET'})
      .then(response => {
        if (!response.ok) {
          throw new FintoError(response.status, response.text());
        }
        return response.json();
      });
  }
}
