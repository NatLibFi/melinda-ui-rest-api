//*****************************************************************************
//
// Marc subfield manipulations
//
//*****************************************************************************

/* eslint-disable no-unused-vars */

import {createLogger} from '@natlibfi/melinda-backend-commons';
const logger = createLogger();

//-----------------------------------------------------------------------------
// Subfield manipulations
//-----------------------------------------------------------------------------

export const Subfield = {

  //---------------------------------------------------------------------------

  from(record, query) {
    const fields = record.get(query);
    return Subfield.fromFields(fields);
  },

  fromFields(...fields) {
    return fields.flat().map(f => f.subfields).flat();
  },

  concat(...subfields) {
    //logger.debug(`Subfields: ${JSON.stringify(subfields.flat())}`);
    return subfields.flat();
  },

  //---------------------------------------------------------------------------

  getByCode(subfields, code) {
    return subfields.filter(s => s.code.match(code));
  },
  getByValue(subfields, value) {
    return subfields.filter(s => s.value.match(value));
  },
  dropByCode(subfields, code) {
    return subfields.filter(s => !s.code.match(code));
  },
  dropByValue(subfields, value) {
    return subfields.filter(s => !s.value.match(value));
  },

  //---------------------------------------------------------------------------
  // Grouping subfields together. The separting code can either start or end
  // a group. Examples:
  //
  // F020: [a: ISBN, q: format] -> group with leading a
  // 776: [i: format, z: ISBN] -> group with trailing z

  groupByLeadingCode(subfields, code) {
    return subfields.reduce(
      (grouped, subfield) => {
        const head = grouped.length > 1 ? grouped.slice(0, -1) : [];
        const tail = grouped.slice(-1).flat();

        //logger.debug(`Grouped: ${JSON.stringify(grouped)}`);
        //logger.debug(`Head: ${JSON.stringify(head)}`);
        //logger.debug(`Tail: ${JSON.stringify(head)}`);

        if (subfield.code.match(code)) {
          return [...head, tail, [subfield]];
        }
        return [...head, tail.concat(subfield)];
      },
      [[]]
    ).filter(g => g.length);
  },

  groupByTrailingCode(subfields, code) {
    return subfields.reduce(
      (grouped, subfield) => {
        const head = grouped.length > 1 ? grouped.slice(0, -1) : [];
        const tail = grouped.slice(-1).flat();

        //logger.debug(`Grouped: ${JSON.stringify(grouped)}`);
        //logger.debug(`Head: ${JSON.stringify(head)}`);
        //logger.debug(`Tail: ${JSON.stringify(head)}`);

        if (subfield.code.match(code)) {
          return [...head, tail.concat(subfield), []];
        }
        return [...head, tail.concat(subfield)];
      },
      []
    ).filter(g => g.length);
  }
};
