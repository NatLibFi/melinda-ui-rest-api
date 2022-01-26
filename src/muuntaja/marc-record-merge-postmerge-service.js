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

/* eslint-disable functional/immutable-data, functional/no-conditional-statement, max-lines */

/*

Post-merge:
B warn: Merged record has 041a field with length less than 3. This may break when saved to aleph.

Actions:

Adds LOW tags from source & target
Adds sid fields from source & target (if low is also there). So if source has extra sids, they are dropped.
Adds extra SID volsi for VOLTE (Todo: make these pairs configurable)
Adds FCC SID fields if no other sids exist

Adds 035z with (FI-MELINDA)' + other_id },
Adds 035z with (FI-MELINDA)' + preferred_id },

adds 583 "MERGED FROM..."
adds 500 a "Lisäpainokset: " (inferred from 250, and 008)

*/

import _, {isEmpty, orderBy, sortBy} from 'lodash';
import {MarcRecord} from '@natlibfi/marc-record';
import moment from 'moment';
import {selectValues, selectRecordId, selectFieldsByValue, fieldHasSubfield, resetComponentHostLinkSubfield, isLinkedFieldOf} from './marc-record-utils';
import {fieldOrderComparator} from './marc-field-sort';
import {eToPrintPreset} from './config/e-to-print/postmerge/eToPrint-postmerge';
import {curry} from 'ramda';
import {findTag, findIndex, filterTag, updateParamsfield, replaceFieldsFromSource, updatedMergedRecordParams} from './utils';

const defaultPreset = [
  // fix776Order,
  check041aLength,
  setAllZeroRecordId,
  sortMergedRecordFields,
  printToE200q,
  prinToE300b,
  printToE_importFields, // eslint-disable-line camelcase
  printToE264,
  printToE880,
  printToE490_830, // eslint-disable-line camelcase
  printToE776,
  add080VersionCode
];

const fennicaPreset = [
  // fix776Order,
  check041aLength,
  setAllZeroRecordId,
  sortMergedRecordFields,
  printToE200q,
  prinToE300b,
  printToE_importFields, // eslint-disable-line camelcase
  printToE264,
  printToE880,
  printToE490_830, // eslint-disable-line camelcase
  printToE776,
  add080VersionCode,
  fenniKEEPTo776
];

const allPreset = [
  check041aLength,
  addLOWSIDFieldsFromOther,
  addLOWSIDFieldsFromPreferred,
  add035zFromOther,
  add035zFromPreferred,
  removeExtra035aFromMerged,
  setAllZeroRecordId,
  add583NoteAboutMerge,
  removeCATHistory,
  add500ReprintInfo,
  handle880Fields,
  sortMergedRecordFields
];

export const preset = {
  defaults: defaultPreset,
  fennica: fennicaPreset,
  eToPrintPreset,
  all: allPreset
};

export function printToE776(targetRecord, sourceRecord, mergedRecordParam) {
  const regex = /^776$/u;
  const fieldsFromMergedRecordParam = mergedRecordParam.fields.filter(field => regex.test(field.tag));

  const sortedFields = fieldsFromMergedRecordParam.reduce((collection, tag) => {
    collection.push({...tag, subfields: sortBy(tag.subfields, 'code')}); // eslint-disable-line functional/immutable-data
    return collection;
  }, []);

  if (!isEmpty(fieldsFromMergedRecordParam)) {
    const filteredMergedRecordParam = {
      ...mergedRecordParam,
      fields: mergedRecordParam.fields.filter(field => !regex.test(field.tag))
        .concat(sortedFields)
    };

    return {
      mergedRecord: new MarcRecord({
        ...filteredMergedRecordParam,
        fields: orderBy([...filteredMergedRecordParam.fields], 'tag')
      })
    };
  }

  return {mergedRecord: new MarcRecord(mergedRecordParam)};
}

export function printToE490_830(targetRecord, sourceRecord, mergedRecordParam) { // eslint-disable-line camelcase
  const fieldTag = ['490', '830'];

  const fieldPresent = curry((length, field) => {
    if (field.code === 'x') {
      return xSubfieldPunctuation(length, field);
    }
    return field;
  });

  const updatedRecord = fieldTag.reduce((record, fieldTag) => {
    const tag = {...filterTag(sourceRecord, fieldTag)};
    if (!isEmpty(tag)) { // eslint-disable-line functional/no-conditional-statement
      const updatedSubfields = {
        ...tag,
        subfields: tag.subfields.map(fieldPresent(tag.subfields.length))
      };
      const recordParams = updatedMergedRecordParams(record, updatedSubfields, findIndex(mergedRecordParam, fieldTag));
      record = recordParams; // eslint-disable-line no-param-reassign
    }

    return record;
  }, mergedRecordParam);

  return {
    mergedRecord: new MarcRecord(updatedRecord)
  };

  function xSubfieldPunctuation(length, field) {
    return length > 2 ? {...field, value: ';'} : {...field, value: ''};
  }
}

export function printToE880(targetRecord, sourceRecord, mergedRecordParam) {
  const tags = sourceRecord.fields.filter(field => field.tag === '880');
  const updatedFields = orderBy(mergedRecordParam.fields.concat(tags), 'tag');
  return {mergedRecord: new MarcRecord({...mergedRecordParam, fields: updatedFields})};
}

export function printToE264(targetRecord, sourceRecord, mergedRecordParam) {
  const tags = sourceRecord.fields.filter(field => field.tag === '264');

  if (!isEmpty(tags)) {
    const filteredTags = tags.reduce((collection, tag) => {
      if (tag.ind2 === '1' || tag.ind2 === '4') { // eslint-disable-line functional/no-conditional-statement
        collection.push(tag); // eslint-disable-line functional/immutable-data
      }
      return collection;
    }, []);

    const filteredMergedRecordParamFields = mergedRecordParam.fields.filter(field => field.tag !== '264');
    const updatedFields = orderBy(filteredMergedRecordParamFields.concat(filteredTags), 'tag');

    return {mergedRecord: new MarcRecord({...mergedRecordParam, fields: updatedFields})};
  }

  return {mergedRecord: new MarcRecord({...mergedRecordParam, fields: mergedRecordParam.fields.filter(field => field.tag !== '264')})};
}

export function printToE_importFields(targetRecord, sourceRecord, mergedRecordParam) { // eslint-disable-line camelcase
  const mergeConfigurationFields = /^(336|066|080)$/u; // eslint-disable-line prefer-named-capture-group
  return replaceFieldsFromSource(mergeConfigurationFields, sourceRecord, mergedRecordParam);
}

export function prinToE300b(preferredRecord, otherRecord, mergedRecordParam) { // eslint-disable-line max-statements
  const tag = findTag(mergedRecordParam.fields, '300');
  if (tag) {
    const fieldB = tag.subfields.find(field => field.code === 'b');
    if (fieldB) {
      const fieldIndex = findIndex(mergedRecordParam, '300');
      const semicolon = fieldB.value.substr(-1) === ';';
      const subfield = semicolon ? removeSemicolon(fieldB) : fieldB;
      const updatedTag = {
        ...tag,
        subfields: tag.subfields.map(field => updatedSubfields(field, subfield.value))
      };

      return {mergedRecord: new MarcRecord(updateParamsfield(mergedRecordParam, updatedTag.subfields, fieldIndex))};
    }
  }
  return {mergedRecord: new MarcRecord(mergedRecordParam)};

  function updatedSubfields(field, value) {
    if (field.code === 'a') {
      return {...field, value: `${field.value} :`};
    }
    if (field.code === 'b') {
      return {...field, value};
    }
    return field;
  }

  function removeSemicolon(fieldB) {
    return {...fieldB, value: fieldB.value.substring(0, fieldB.value.length - 1).trim()};
  }
}

// creates an empty q subfield if q value not present, tag 020
export function printToE200q(preferredRecord, otherRecord, mergedRecordParam) {
  const tag = findTag(mergedRecordParam.fields, '020');

  if (tag && isEmpty(tag.subfields.filter(obj => obj.code === 'q'))) {
    const updatedSubfields = {
      ...tag,
      subfields: [
        ...tag.subfields,
        {
          code: 'q',
          value: ' '
        }
      ]
    };

    const update020 = curry((updatedSubfields, field) => {
      if (field.tag === '020') {
        return updatedSubfields;
      }
      return field;
    });

    const updatedRecord = {
      ...mergedRecordParam,
      fields: mergedRecordParam.fields.map(update020(updatedSubfields))
    };
    return {mergedRecord: new MarcRecord(updatedRecord)};
  }

  return {mergedRecord: new MarcRecord(mergedRecordParam)};

  function findTag(fields, value) {
    return fields.find(obj => obj.tag === value);
  }
}

// Not going to do anything if there are multiple 776 fields.
// export function fix776Order(preferredRecord, otherRecord, mergedRecordParam) {
//   let mergedRecord = new MarcRecord(mergedRecordParam);
//   let f776 = mergedRecord.fields.filter(field => field.tag === '776');

//   if( f776.length !== 1 ) {
//     return { mergedRecord };
//   } else {
//     mergedRecord.fields.forEach(field => {
//       if ( field.tag === '776' ) {
//         field.subfields.sort(function(x, y) {
//           if( x.code < y.code ) return -1;
//           if( x.code > y.code ) return 1;
//           return 0;
//         });
//       }
//     });
//   }
//   return { mergedRecord };
// }

export function applyPostMergeModifications(postMergeFunctions, preferredRecord, otherRecord, originalMergedRecord) {
  const mergedRecord = new MarcRecord(originalMergedRecord);
  const initial_value = { // eslint-disable-line camelcase
    mergedRecord,
    notes: []
  };

  const result = postMergeFunctions.reduce((result, fn) => {
    const fnResult = fn(preferredRecord, otherRecord, result.mergedRecord);
    return {
      mergedRecord: fnResult.mergedRecord,
      notes: _.concat(result.notes, fnResult.notes || [])
    };
  }, initial_value);

  return {
    record: result.mergedRecord,
    notes: result.notes
  };
}

export function check041aLength(preferredRecord, otherRecord, mergedRecord) {
  const notes = _.chain(mergedRecord.fields)
    .filter(field => field.tag === '041')
    .flatMap(field => field.subfields.filter(subfield => subfield.code === 'a'))
    .filter(subfield => subfield.value.length < 3)
    .map(() => 'Record has 041a field with length less than 3. This may break when saved to aleph.')
    .value();

  return {
    mergedRecord,
    notes
  };
}

export function addLOWSIDFieldsFromOther(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);

  const otherRecordLOWFieldList = otherRecord.fields
    .filter(field => field.tag === 'LOW');
  mergedRecord.fields = mergedRecord.fields.concat(otherRecordLOWFieldList);

  const otherRecordLibraryIdList = selectValues(otherRecord, 'LOW', 'a');

  otherRecordLibraryIdList.forEach(libraryId => {
    const otherRecordSIDFieldList = selectFieldsByValue(otherRecord, 'SID', 'b', libraryId.toLowerCase());
    if (otherRecordSIDFieldList.length > 0) {
      mergedRecord.fields = _.concat(mergedRecord.fields, otherRecordSIDFieldList);
    } else {
      const otherRecordId = selectRecordId(otherRecord);

      mergedRecord.fields.push(createField({
        tag: 'SID',
        subfields: [
          {code: 'c', value: `FCC${otherRecordId}`},
          {code: 'b', value: libraryId.toLowerCase()}
        ]
      }));
    }
  });

  otherRecordLibraryIdList.forEach(libraryId => {

    /* TODO: Add here config -table for extra SID $b value / libraryID pairs */ // eslint-disable-line no-warning-comments

    if (libraryId === 'VOLTE') {
      const otherRecordSIDExtraFieldList = selectFieldsByValue(otherRecord, 'SID', 'b', 'volsi');

      if (otherRecordSIDExtraFieldList.length > 0) {
        mergedRecord.fields = _.concat(mergedRecord.fields, otherRecordSIDExtraFieldList);
      }
    }
  });

  return {
    mergedRecord
  };
}

export function addLOWSIDFieldsFromPreferred(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);

  const preferredRecordLibraryIdList = selectValues(preferredRecord, 'LOW', 'a');

  preferredRecordLibraryIdList.forEach(libraryId => {
    const preferredRecordSIDFieldList = selectFieldsByValue(preferredRecord, 'SID', 'b', libraryId.toLowerCase());

    if (preferredRecordSIDFieldList.length === 0) {

      const preferredRecordId = selectRecordId(preferredRecord);

      mergedRecord.fields.push(createField({
        tag: 'SID',
        subfields: [
          {code: 'c', value: `FCC${preferredRecordId}`},
          {code: 'b', value: libraryId.toLowerCase()}
        ]
      }));
    }
  });

  return {
    mergedRecord
  };
}

export function add035zFromOther(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);
  const otherRecordId = selectRecordId(otherRecord);

  mergedRecord.fields.push(createField({
    tag: '035',
    subfields: [{code: 'z', value: `(FI-MELINDA)${otherRecordId}`}]
  }));

  return {
    mergedRecord
  };
}

export function add035zFromPreferred(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);
  const preferredRecordId = selectRecordId(preferredRecord);

  mergedRecord.fields.push(createField({
    tag: '035',
    subfields: [{code: 'z', value: `(FI-MELINDA)${preferredRecordId}`}]
  }));

  return {
    mergedRecord
  };
}

export function removeExtra035aFromMerged(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);

  mergedRecord.fields = mergedRecord.fields.reduce((fields, field) => {

    if (field.tag === '035') {
      field.subfields = field.subfields.filter(subfield => {
        const isExtraSubfield = subfield.code === 'a' && subfield.value.substr(0, 12) === '(FI-MELINDA)';
        return isExtraSubfield === false;
      });

      if (field.subfields.length === 0) {
        return fields;
      }
    }

    return _.concat(fields, field);
  }, []);

  return {
    mergedRecord
  };
}

export function add080VersionCode(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);

  mergedRecord.fields.filter(({tag, subfields}) => {
    return tag === '080' && !has2() && has9Keep();

    function has9Keep() {
      return subfields.some(({code, value}) => code === '9' && value === 'FENNI<KEEP>');
    }

    function has2() {
      return subfields.some(({code}) => code === '2');
    }
  }).forEach(({subfields}) => {
    const index = subfields.findIndex(sub => Number(sub.code) > 2);
    if (index >= 0) {
      subfields.splice(index, 0, {code: '2', value: '1974/fin/fennica'});
    } else {
      subfields.push({code: '2', value: '1974/fin/fennica'});
    }
  });

  return {
    mergedRecord
  };
}

export function fenniKEEPTo776(targetRecord, sourceRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);
  mergedRecord.fields.filter(({tag}) => tag === '776').forEach(({subfields}) => {
    subfields.push({code: '9', value: 'FENNI<KEEP>'});
  });

  return {
    mergedRecord
  };
}

export function setAllZeroRecordId(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);

  mergedRecord.fields = mergedRecord.fields.filter((field) => field.tag !== '001');
  mergedRecord.fields.push(createField({
    tag: '001',
    value: '000000000'
  }));

  return {
    mergedRecord
  };
}

export function add583NoteAboutMerge(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);
  const preferredRecordId = selectRecordId(preferredRecord);
  const otherRecordId = selectRecordId(otherRecord);

  mergedRecord.fields.push(createField({
    tag: '583',
    subfields: [
      {code: 'a', value: `MERGED FROM (FI-MELINDA)${otherRecordId} + (FI-MELINDA)${preferredRecordId}`},
      {code: 'c', value: formatDate(new Date())},
      {code: '5', value: 'MELINDA'}
    ]
  }));

  return {
    mergedRecord
  };
}

export function removeCATHistory(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);

  mergedRecord.fields = mergedRecord.fields.filter(field => field.tag !== 'CAT');

  return {
    mergedRecord
  };
}

export function add500ReprintInfo(preferredRecord, otherRecord, mergedRecordParam) {

  const mergedRecord = new MarcRecord(mergedRecordParam);

  otherRecord.fields
    .filter(field => field.tag === '250')
    .filter(field => !mergedRecord.fields.some(fieldInMerged => _.isEqual(fieldInMerged, field))).map((field) => field.subfields
      .filter(sub => sub.code === 'a')
      .map(sub => sub.value.trim())).forEach((reprintText) => {
      let text = `Lisäpainokset: ${reprintText}`; // eslint-disable-line functional/no-let
      const f008 = _.head(otherRecord.fields.filter(field => field.tag === '008'));

      if (f008 !== undefined) {
        const year = f008.value.substr(7, 4);

        if (!isNaN(year)) {
          text += ` ${year}`;
        }
      }

      if (!(/\.$/u).test(text)) {
        text += '.';
      }

      if (!mergedRecord.fields.filter(field => field.tag === '500').some(fieldHasSubfield('a', text))) {
        mergedRecord.fields.push(createField({
          tag: '500',
          subfields: [{code: 'a', value: text}]
        }));
      }
    });

  return {
    mergedRecord
  };
}

export function handle880Fields(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);

  const fieldsWithout880 = mergedRecord.fields.filter(field => field.tag !== '880');

  const fieldsWithLinkedContent = fieldsWithout880
    .filter(field => field.subfields)
    .filter(field => field.subfields.some(subfield => subfield.code === '6'));

  const relinked880Fields = _.chain(fieldsWithLinkedContent).flatMap((field, i) => {

    const fieldInPreferred = _.chain(preferredRecord.fields).filter(fieldInPreferred => fieldInPreferred.uuid === field.uuid).value();
    const fieldInOther = _.chain(otherRecord.fields).filter(otherRecord => otherRecord.uuid === field.uuid).value();

    const linkedFieldsFromPreferred = _.flatMap(fieldInPreferred, (fieldWithLink) => preferredRecord.fields.filter(isLinkedFieldOf(fieldWithLink)));

    const linkedFieldsFromOther = _.flatMap(fieldInOther, (fieldWithLink) => otherRecord.fields.filter(isLinkedFieldOf(fieldWithLink)));

    const linkedFields = _.concat(_.cloneDeep(linkedFieldsFromPreferred), _.cloneDeep(linkedFieldsFromOther));

    updateLinks(i + 1, field, linkedFields);

    return linkedFields;

  }).value();

  mergedRecord.fields = _.concat(fieldsWithout880, relinked880Fields);

  return {mergedRecord};
}

function updateLinks(linkIndex, field, linkedFieldList) {
  const {tag} = field;
  const linkIndexNormalized = _.padStart(linkIndex, 2, '0');

  field.subfields.forEach(sub => {
    if (sub.code === '6') {
      sub.value = `880-${linkIndexNormalized}`;
    }
  });

  linkedFieldList.forEach(field => {
    field.subfields.forEach(sub => {
      if (sub.code === '6') {
        sub.value = `${tag}-${linkIndexNormalized}`;
      }
    });
  });
}

export function sortMergedRecordFields(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);
  mergedRecord.fields.sort(fieldOrderComparator);

  return {mergedRecord};
}

export function select773Fields(preferredHostRecordId, othterHostRecordId, keepBoth = false) {
  return function (preferredRecord, otherRecord, mergedRecord) {
    const linksToPreferredHost = mergedRecord.fields.filter(field => field.tag === '773' && field.subfields.filter(s => s.code === 'w').some(s => s.value === `(FI-MELINDA)${preferredHostRecordId}`));
    const linksToOtherHost = mergedRecord.fields.filter(field => field.tag === '773' && field.subfields.filter(s => s.code === 'w').some(s => s.value === `(FI-MELINDA)${othterHostRecordId}`));

    const fieldsWithoutLinks = _.difference(mergedRecord.fields, _.concat(linksToPreferredHost, linksToOtherHost));

    if (keepBoth) {
      mergedRecord.fields = _.concat(fieldsWithoutLinks, linksToPreferredHost, linksToOtherHost);
    } else if (linksToPreferredHost.length > 0) { // eslint-disable-line functional/no-conditional-statement
      mergedRecord.fields = _.concat(fieldsWithoutLinks, linksToPreferredHost); // eslint-disable-line functional/immutable-data
    } else { // eslint-disable-line functional/no-conditional-statement
      mergedRecord.fields = _.concat(fieldsWithoutLinks, linksToOtherHost.map(resetComponentHostLinkSubfield)); // eslint-disable-line functional/immutable-data
    }

    return {
      mergedRecord
    };

  };
}

function createField(fieldContent) {
  return _.assign({}, {
    ind1: ' ',
    ind2: ' '
  }, fieldContent);
}

function formatDate(date) {
  return moment(date).format('YYYY-MM-DDTHH:mm:ssZ');
}
