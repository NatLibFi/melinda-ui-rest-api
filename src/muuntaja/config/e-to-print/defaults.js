//*****************************************************************************
//
// Default values for fields in printed(?) material
//
// THIS IS A COPY OF file://./../print-to-e/defaults.js, MAY NEED REWORK
// FOR E2P INDIVIDUAL FIELDS
//
//*****************************************************************************

import moment from 'moment';

const year = new Date().getFullYear().toString().substring(0, 4);

const defaultFieldValues = {
  'LDR': {value: '00000cam^a22006134i^4500'},
  '001': {value: '<placeholder>'},
  '003': {
    value: 'FI-MELINDA',
    id: '61d15079-0643-453c-bfd6-023044c28ef7'
  },
  '005': {value: '<placeholder>'},
  '007': {
    value: 'cr^||^||||||||',
    id: '7e290cd1-6bed-4447-8fc3-c1f7e41b760a'
  },
  '008': {
    // value: '^^^^^^s2018^^^^fi^||||^o^^^^^|0|^0|   |^',
    value: `^^^^^^s${year}^^^^fi^||||^^^^^^^|0|^0|fin|c`,
    id: '4bc968f1-9186-4d04-ba09-7537d0c4ee95'
  },
  '020': (opts) => ({
    ind1: ' ', ind2: ' ',
    subfields: [
      {code: 'a', value: ''},
      {code: 'q', value: opts.format}
    ],
    id: '1ed797e0-1026-425b-9ef4-fc4d3771914a'
  }),
  '040': {
    ind1: ' ', ind2: ' ',
    subfields: [
      {code: 'a', value: ''}, // Get from user's profile (ISIL code)
      {code: 'b', value: 'fin'},
      {code: 'e', value: 'rda'}
    ],
    id: '6f4d044c-28f4-4616-9edb-89ec47856cab'
  },
  '041': (opts) => ({
    tag: '041', ind1: '0', ind2: ' ',
    subfields: [{code: 'a', value: opts.language || ''}],
    id: 'ac44d08d-5532-49bc-b2b9-c863cf930b1a'
  }),
  '042': {
    tag: '042', ind1: ' ', ind2: ' ',
    subfields: [{code: 'a', value: 'finb'}],
    id: 'f23d6e0c-5ccd-46b6-8170-4b8ad9f6ba64'
  },
  '300': {
    ind1: ' ', ind2: ' ',
    subfields: [{code: 'a', value: '1 verkkoaineisto'}],
    id: '29b213aa-4cb5-44cf-83d5-a0042638f64f'
  },
  '337': {
    ind1: ' ', ind2: ' ',
    subfields: [
      {code: 'a', value: 'käytettävissä ilman laitetta'},
      {code: 'b', value: 'n'},
      {code: '2', value: 'rdamedia'}
    ],
    id: '66029c77-30a4-42a2-bf23-6499ca97fe87'
  },
  '338': {
    ind1: ' ', ind2: ' ',
    subfields: [
      {code: 'a', value: 'nide'},
      {code: 'b', value: 'nc'},
      {code: '2', value: 'rdacarrier'}
    ],
    id: '55e6067b-8eba-44c1-a53c-293641a40729'
  },
  '506/1': {
    tag: '506', ind1: '0', ind2: ' ',
    subfields: [
      {code: 'a', value: 'Aineisto on vapaasti saatavissa.'},
      {code: 'f', value: 'Unrestricted online access'},
      {code: '2', value: 'star'}
    ],
    id: '6b459901-5a45-46d6-9469-f414cab03d2f'
  },
  '506/2': {
    tag: '506', ind1: '1', ind2: ' ',
    subfields: [
      {code: 'a', value: 'Käytettävissä lisenssin hankkineissa organisaatioissa.'},
      {code: 'f', value: 'Online access with authorization'},
      {code: '2', value: 'star'}
    ],
    id: '39858a85-ef1e-4946-ba32-0daa8ee52381'
  },
  '530': {
    ind1: ' ', ind2: ' ',
    subfields: [{code: 'a', value: 'Julkaistu myös painettuna.'}],
    id: 'd046fbea-5c5c-4f1f-84de-c8ae5bd19043'
  },

  //---------------------------------------------------------------------------
  // Default LOW
  'LOW': (opts) => ({
    tag: 'LOW', ind1: ' ', ind2: ' ',
    subfields: [{code: 'a', value: opts.LOWTAG}],
    id: '98e21f26-9908-4419-8afa-83f56172b801'
  }),

  //---------------------------------------------------------------------------
  // Default values for Fennica fields.
  '506/FENNI': {
    tag: '506', ind1: '1', ind2: ' ',
    subfields: [
      {code: 'a', value: 'Aineisto on käytettävissä vapaakappalekirjastoissa.'},
      {code: 'f', value: 'Online access with authorization.'},
      {code: '2', value: 'star'},
      {code: '5', value: 'FI-Vapaa'},
      {code: '9', value: 'FENNI<KEEP>'}
    ],
    id: '52527d71-596e-47b1-86c7-d6978554d24b'
  },
  '530/FENNI': {
    tag: '530', ind1: ' ', ind2: ' ',
    subfields: [
      {code: 'a', value: 'Julkaistu myös painettuna.'},
      {code: '9', value: 'FENNI<KEEP>'}
    ],
    id: 'd046fbea-5c5c-4f1f-84de-c8ae5bd19043'
  },
  '540/FENNI': {
    tag: '540', ind1: ' ', ind2: ' ',
    subfields: [
      {code: 'a', value: 'Aineisto on käytettävissä tutkimus- ja muihin tarkoituksiin;'},
      {code: 'b', value: 'Kansalliskirjasto;'},
      {code: 'c', value: 'Laki kulttuuriaineistojen tallentamisesta ja säilyttämisestä'},
      {code: 'u', value: 'http://www.finlex.fi/fi/laki/ajantasa/2007/20071433'},
      {code: '5', value: 'FI-Vapaa'},
      {code: '9', value: 'FENNI<KEEP>'}
    ],
    id: 'c5e997c8-cf6b-4a98-ba17-9cfb42a71f86'
  },
  '856/FENNI': {
    tag: '856', ind1: '4', ind2: '0',
    subfields: [
      {code: 'u', value: ''},
      {code: 'z', value: 'Käytettävissä vapaakappalekirjastoissa'},
      {code: '5', value: 'FI-Vapaa'}
    ],
    id: 'ccb0cd8f-ea75-434e-a107-71a6278d23b0'
  },
  '901/FENNI': (opts) => ({ // eslint-disable-line no-unused-vars
    tag: '901', ind1: ' ', ind2: ' ',
    subfields: [
      {code: 'a', value: `SU${moment().format('YYYMMDD')}`},
      {code: '5', value: 'FENNI'}
    ],
    id: '5b0d0d41-0975-4677-ab9b-314771f95fcb'
  }),

  //---------------------------------------------------------------------------
  // Generally for testing purposes
  'LOW/KVP': {
    tag: 'LOW', ind1: ' ', ind2: ' ',
    subfields: [{code: 'a', value: 'KVP'}],
    id: '9a77bccc-d0fe-4d6d-a326-b3cf666b3b0a'
  },
  'LOW/ALMA': {
    tag: 'LOW', ind1: ' ', ind2: ' ',
    subfields: [{code: 'a', value: 'ALMA'}],
    id: 'e0d789ec-6548-4db0-85ae-4cd2e4acbe2f'
  },
  'LOW/FENNI': {
    tag: 'LOW', ind1: ' ', ind2: ' ',
    subfields: [{code: 'a', value: 'FENNI'}],
    id: 'd8efb4ce-b01f-433f-8a1a-76bc5313d785'
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
