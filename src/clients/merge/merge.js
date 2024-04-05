//*****************************************************************************
//
// New "Reactless" Muuntaja Sketch
//
//*****************************************************************************

import {
  showServerNotifications,
  showTab
} from '/common/ui-utils.js';

import {
  deleteFromTransformed,
  getTransformed,
  initModule,
  parseUrlParameters,
  sharedSaveJson
} from '/merge/common.js';

import { Account, doLogin } from '/common/auth.js';

//-----------------------------------------------------------------------------
// on page load:
//-----------------------------------------------------------------------------

window.initialize = function () {
  console.log('Initializing');
  initModule({
    canUseProfileType: false,
    transformedOptions: {
      type: 'merge',
      profile: undefined
    }
  });

  showServerNotifications({ clientName: 'merge', onSuccess: () => { doLogin(authSuccess); } });

  function authSuccess(user) {
    setOptions();
    const accountMenu = document.getElementById('accountMenu');
    accountMenu.classList.add('show');
    const username = document.querySelector('#accountMenu #username');
    username.innerHTML = Account.get().Name;
    showTab('muuntaja'); //refers to tab in merge.html, its still with the name of muuntaja
    parseUrlParameters();
    doTransform();
  }
};

//-----------------------------------------------------------------------------

function setOptions() {
  if (!getTransformed().base?.ID) deleteFromTransformed('base');//delete transformed.base;
  deleteFromTransformed('stored');
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
// Show transformation results
//-----------------------------------------------------------------------------

window.saveJson = (event) => sharedSaveJson({ event, hasOptionsToUpdate: true });
