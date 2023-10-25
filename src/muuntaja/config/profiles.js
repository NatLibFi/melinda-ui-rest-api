/******************************************************************************
 *
 * User selectable muuntaja profiles
 *
 ******************************************************************************
 */

//-----------------------------------------------------------------------------
// Make this a list. Give the records names meant for menu. Add transform options to list.
// Add handling those to UI

import p2eProfile from './print-to-e';
import e2pProfile from './e-to-print';

export const profiles = {
  'p2e': p2eProfile,
  'e2p': e2pProfile
};

/*
export const printToE = {
  mergeType: 'printToE',
  baseRecord,
  'defaults': defaultPreset,
  'aleph': mergeProfiles,
  'kvp': mergeProfiles,
  'fenni': {
    'default': mergeProfiles.default,
    'fennica': mergeProfiles.fennica,
    'legal_deposit': mergeProfiles.legal_deposit
  },
  'selma': defaultPreset,
  'halti': defaultPreset
};
*/
