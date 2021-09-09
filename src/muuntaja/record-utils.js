/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for transforming MARC records in Melinda
*
* Copyright (C) 2015-2019 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-muuntaja
*
* melinda-muuntaja program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-muuntaja is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import _ from 'lodash';
import {v4 as uuid} from 'uuid';

const FUTURE_HOST_ID_PLACEHOLDER = '(FI-MELINDA)[future-host-id]';


export function fieldHasSubfield(code, value) {
  const querySubfield = {code, value};

  return function(field) {
    return field.subfields.some(subfield => _.isEqual(subfield, querySubfield));
  };
}

export function selectFieldsByValue(record, tag, subcode, value) {

  return record.fields
    .filter(field => field.tag === 'SID')
    .filter(field => field.subfields.some(subfield => subfield.code === subcode && subfield.value === value));
}

export function selectValues(record, tag, subcode) {
  return _.chain(record.fields)
    .filter(field => tag.equals ? tag.equals(field.tag) : tag === field.tag)
    .flatMap(field => field.subfields)
    .filter(subfield => subcode.equals ? subcode.equals(subfield.code) : subcode === subfield.code)
    .map(subfield => subfield.value)
    .filter(value => value !== undefined)
    .value();
}

export function selectRecordId(record) {

  const field001List = record.fields.filter(field => field.tag === '001');

  if (field001List.length === 0) {
    throw new Error('Could not parse record id');
  } else {
    return field001List[0].value;
  }
}

export function selectFirstValue(field, subcode) {
  if (field.subfields) {
    return _.chain(field.subfields)
      .filter(subfield => subcode.equals ? subcode.equals(subfield.code) : subcode === subfield.code)
      .map(subfield => subfield.value)
      .head()
      .value();
  }
  return field.value;

}

export function decorateFieldsWithUuid(record) {
  record.fields.forEach(field => {
    field.uuid = uuid.v4(); // eslint-disable-line functional/immutable-data
  });
}

export function setRecordId(record, newId) {

  record.fields = record.fields.filter((field) => field.tag !== '001'); // eslint-disable-line functional/immutable-data

  record.fields.unshift({ // eslint-disable-line functional/immutable-data
    uuid: uuid.v4(),
    tag: '001',
    value: newId
  });
}


export function resetRecordId(record) {

  record.fields = record.fields.filter((field) => field.tag !== '001'); // eslint-disable-line functional/immutable-data

  record.fields.unshift({ // eslint-disable-line functional/immutable-data
    uuid: uuid.v4(),
    tag: '001',
    value: '000000000'
  });

}

export function resetComponentHostLinkSubfield(field) {
  if (field.subfields) {

    const updatedSubfields = field.subfields.map(sub => {
      if (sub.code === 'w') { // eslint-disable-line functional/no-conditional-statement
        sub.value = FUTURE_HOST_ID_PLACEHOLDER; // eslint-disable-line functional/immutable-data
      }
      return sub;
    });

    field.subfields = updatedSubfields; // eslint-disable-line functional/immutable-data

    return field;

  }
  return field;

}

export function getLink(field) {
  const links = _.get(field, 'subfields', [])
    .filter(sub => sub.code === '6')
    .map(normalizeSub_6)
    .map(sub => sub.value)
    .map(link => link.split('-'));

  return _.head(links) || [];
}

function normalizeSub_6(subfield) { // eslint-disable-line camelcase
  let {code, value} = subfield; // eslint-disable-line functional/no-let, prefer-const
  if (subfield.code === '6') { // eslint-disable-line functional/no-conditional-statement
    value = _.head(value.split('/'));
  }
  return {code, value};
}

export function isLinkedFieldOf(queryField) {
  const [queryTag, queryLinkNumber] = getLink(queryField);

  return function(field) {

    const linkInLinkedField = getLink(field);
    const [linkTag, linkNumber] = linkInLinkedField;

    const fieldMatchesQueryLinkTag = field.tag === queryTag;
    const linkNumberMatchesQueryLinkNumber = linkNumber === queryLinkNumber;
    const linkTagLinksBackToQueryField = linkTag === queryField.tag;

    return fieldMatchesQueryLinkTag && linkNumberMatchesQueryLinkNumber && linkTagLinksBackToQueryField;
  };
}

export function toOnlySubfields(tag, subfieldCodes) {
  return function(field) {
    if (field.tag === tag) {
      const subfields = field.subfields.filter(s => _.includes(subfieldCodes, s.code));
      return _.assign({}, field, {subfields});
    }
    return field;
  };
}
