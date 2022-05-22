//*****************************************************************************
//
// Default values for fields in electronic material
//
//*****************************************************************************

const defaultFieldValues = {
  'LDR': {value: '00000cam^a22006134i^4500'},
  '001': {value: '<placeholder>'},
  '003': {
    value: 'FI-MELINDA',
    uuid: '61d15079-0643-453c-bfd6-023044c28ef7'
  },
  '005': {value: '<placeholder>'},
  '007': {
    value: 'cr^||^||||||||',
    uuid: '7e290cd1-6bed-4447-8fc3-c1f7e41b760a'
  },
  '008': {
    value: '^^^^^^s2018^^^^fi^||||^o^^^^^|0|^0|   |^',
    uuid: '4bc968f1-9186-4d04-ba09-7537d0c4ee95'
  },
  '020': (opts) => ({
    ind1: ' ', ind2: ' ',
    subfields: [
      {code: 'a', value: ''},
      {code: 'q', value: opts.format}
    ],
    uuid: '1ed797e0-1026-425b-9ef4-fc4d3771914a'
  }),
  '040': {
    ind1: ' ', ind2: ' ',
    subfields: [
      {code: 'a', value: ''}, // Get from user's profile (ISIL code)
      {code: 'b', value: 'fin'},
      {code: 'e', value: 'rda'}
    ],
    uuid: '6f4d044c-28f4-4616-9edb-89ec47856cab'
  },
  '041': {
    tag: '041', ind1: '0', ind2: ' ',
    subfields: [{code: 'a', value: ''}], // Can be updated from source
    uuid: 'ac44d08d-5532-49bc-b2b9-c863cf930b1a'
  },
  '042': {
    tag: '042', ind1: ' ', ind2: ' ',
    subfields: [{code: 'a', value: 'finb'}],
    uuid: 'f23d6e0c-5ccd-46b6-8170-4b8ad9f6ba64'
  },
  '300': {
    ind1: ' ', ind2: ' ',
    subfields: [{code: 'a', value: '1 verkkoaineisto'}],
    uuid: '29b213aa-4cb5-44cf-83d5-a0042638f64f'
  },
  '337': {
    ind1: ' ', ind2: ' ',
    subfields: [
      {code: 'a', value: 'tietokonekäyttöinen'},
      {code: 'b', value: 'c'},
      {code: '2', value: 'rdamedia'}
    ],
    uuid: '66029c77-30a4-42a2-bf23-6499ca97fe87'
  },
  '338': {
    ind1: ' ', ind2: ' ',
    subfields: [
      {code: 'a', value: 'verkkoaineisto'},
      {code: 'b', value: 'cr'},
      {code: '2', value: 'rdacarrier'}
    ],
    uuid: '55e6067b-8eba-44c1-a53c-293641a40729'
  },
  '506/1': {
    tag: '506', ind1: '0', ind2: ' ',
    subfields: [
      {code: 'a', value: 'Aineisto  on vapaasti saatavissa.'},
      {code: 'f', value: 'Unrestricted online access'},
      {code: '2', value: 'star'}
    ],
    uuid: '6b459901-5a45-46d6-9469-f414cab03d2f'
  },
  '506/2': {
    tag: '506', ind1: '1', ind2: ' ',
    subfields: [
      {code: 'a', value: 'Käytettävissä lisenssin hankkineissa organisaatioissa.'},
      {code: 'f', value: 'Online access with authorization'},
      {code: '2', value: 'star'}
    ],
    uuid: '39858a85-ef1e-4946-ba32-0daa8ee52381'
  },
  '530': {
    ind1: ' ', ind2: ' ',
    subfields: [
      {code: 'a', value: 'Julkaistu myös painettuna.'},
      {code: '9', value: 'FENNI<KEEP>'}
    ],
    uuid: 'd046fbea-5c5c-4f1f-84de-c8ae5bd19043'
  },

  //---------------------------------------------------------------------------
  // Generally for testing purposes
  'LOW/KVP': {
    tag: 'LOW', ind1: ' ', ind2: ' ',
    subfields: [{code: 'a', value: 'KVP'}],
    uuid: '9a77bccc-d0fe-4d6d-a326-b3cf666b3b0a'
  },
  'LOW/ALMA': {
    tag: 'LOW', ind1: ' ', ind2: ' ',
    subfields: [{code: 'a', value: 'ALMA'}],
    uuid: 'e0d789ec-6548-4db0-85ae-4cd2e4acbe2f'
  },
  'LOW/FENNI': {
    tag: 'LOW', ind1: ' ', ind2: ' ',
    subfields: [{code: 'a', value: 'FENNI'}],
    uuid: 'd8efb4ce-b01f-433f-8a1a-76bc5313d785'
  }
};

//-----------------------------------------------------------------------------

export function getDefaultValue(tag, opts = {}) {
  const value = defaultFieldValues[tag];
  if (value) {
    return {tag, ...typeof value === 'function' ? value(opts) : value};
  }
  return null;
}

export function getFieldOrDefault(record, tag) {
  const fields = record.get(tag);
  if (!fields.length) {
    return [getDefaultValue(tag)];
  }
  return fields;
}
