//*****************************************************************************
//
// New "Reactless" Merge Sketch
//
//*****************************************************************************

import {
  showServerNotifications,
  showTab
} from '/common/ui-utils.js';

import {
  dataModule,
  initCommonModule,
  parseUrlParameters
} from '/merge/common/common.js';

import { Account, doLogin } from '/common/auth.js';

//-----------------------------------------------------------------------------
// on page load:
//-----------------------------------------------------------------------------

const clientName = 'merge';


window.initialize = function () {
  console.log('Initializing');
  initCommonModule({
    client: clientName,
    canUseProfileType: false,
    transformedDefaultOptions: {
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
  if (!dataModule.getTransformed().base?.ID) dataModule.deleteFromTransformed('base');//delete transformed.base;
  dataModule.deleteFromTransformed('stored');
}