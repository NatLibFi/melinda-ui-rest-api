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
  parseUrlParameters
} from '/merge/common.js';

import { Account, doLogin } from '/common/auth.js';

//-----------------------------------------------------------------------------
// on page load:
//-----------------------------------------------------------------------------

const clientName = 'merge';


window.initialize = function () {
  console.log('Initializing');
  initModule({
    client: clientName,
    canUseProfileType: false,
    transformedOptions: {
      type: 'merge',
      profile: undefined
    }
  });

  showServerNotifications({ clientName: clientName, onSuccess: () => { doLogin(authSuccess); } });

  function authSuccess(user) {
    setOptions();
    const accountMenu = document.getElementById('accountMenu');
    accountMenu.classList.add('show');
    const username = document.querySelector('#accountMenu #username');
    username.innerHTML = Account.get().Name;
    showTab(clientName);
    parseUrlParameters();
    doTransform();
  }
};

function setOptions() {
  if (!getTransformed().base?.ID) deleteFromTransformed('base');//delete transformed.base;
  deleteFromTransformed('stored');
}