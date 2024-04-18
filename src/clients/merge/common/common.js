/* ---------------------------------------------------------------------------- */
/* Shared functionalities of MUUNTAJA and MERGE app                             */
/* ---------------------------------------------------------------------------- */

/**
 * Common module is works as index file for different sub modules.
 * Each module has init function to inform user and so that automated linters wont remove unsued imports as some modules have
 * functions available through global window object and thats available only if module is imported.
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import * as dataModule from '/merge/common/dataHandler.js';
import * as dlgModule from '/merge/common/dlgHandler.js';
import * as jsonModule from '/merge/common/jsonHandler.js';
import * as transformModule from '/merge/common/transformationHandler.js';
import * as uiCommonModule from '/merge/common/uiCommonHandler.js';
import * as uiEditModule from '/merge/common/uiEditHandler.js';
import * as urlModule from '/merge/common/urlHandler.js';

//-----------------------------------------------------------------------------
// Exported
//-----------------------------------------------------------------------------

export {
  dataModule, initCommonModule, urlModule
};

/**
 * Clears any variables shared within imported script module,
 * gets called on importing scripts init
 *
 * Default to 'muuntaja' client baviour
 * @param {object|undefined} initData object holding some configuration data for common
 * @param {boolean} initData.canUseProfileType - can user select profile and type for transformation
 * @param {object} initData.transformedOptions - options to override transformed objects options on default
 * @param {string} initData.client - what named client we are using, available locally on dataModule.getClientName(), used to find from html correct div and what to set to url, use lowercase
 */
function initCommonModule(data = {}) {
  console.log(`Common module initializing for ${data?.client}`);
  dataModule.init(data);
  urlModule.init();
  dlgModule.init();
  jsonModule.init();
  uiCommonModule.init();
  uiEditModule.init();
  transformModule.init();
  console.log('All modules initialized');
}

//-----------------------------------------------------------------------------
// Private
//-----------------------------------------------------------------------------


