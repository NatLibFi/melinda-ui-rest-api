//*****************************************************************************
//
// New "Reactless" Muuntaja Sketch
//
//*****************************************************************************

import {
  createDropdownItem, createSelectItem,
  createSelectOption,
  showServerNotifications,
  showTab
} from '/common/ui-utils.js';

import {
  dataModule,
  initCommonModule,
  urlModule,
} from '/merge/common/common.js';

import { Account, doLogin } from '/common/auth.js';
import { profileRequest } from '/common/rest.js';

//-----------------------------------------------------------------------------
// on page load:
//-----------------------------------------------------------------------------

const clientName = 'muuntaja';

window.initialize = function () {
  console.log('Initializing');
  initCommonModule({
    client: clientName,
    transformedDefaultOptions: {
      type: 'p2e',
      profile: 'DEFAULT'
    },
    clientConfigOverride:{
      canUseProfileType: true,
      onNewInstanceRemoveBaseRecord: false
    }
  });

  showServerNotifications({ clientName: clientName, onSuccess: () => { doLogin(authSuccess); } });

  function authSuccess(user) {

    profileRequest()
      .then(profiles => {
        setProfiles(profiles);
        const accountMenu = document.getElementById('accountMenu');
        accountMenu.classList.add('show');
        const username = document.querySelector('#accountMenu #username');
        username.innerHTML = Account.get().name;
        showTab(clientName);
        urlModule.parseUrlParameters();
        doTransform();
      });
  }
};

//-----------------------------------------------------------------------------

function setProfiles(options) {
  console.log('Profiles:', options);

  const updateTransformOptions = {
    options: {
      type: options.type[0].tag,
      profile: options.profile[0].tag,
    }
  };
  dataModule.updateTransformed(updateTransformOptions);

  const typeOptions = document.querySelector('#type-options');
  typeOptions.innerHTML = '';

  const typeDropdown = createDropdownItem('', ['Select', 'VBox'], 'Muunnostyyppi');
  const typeSelect = createSelectItem('type');
  typeSelect.addEventListener('change', (event) => setTransformType(event, event.target.value));

  typeOptions.appendChild(typeDropdown);
  typeDropdown.appendChild(typeSelect);

  for (const type of options.type) {
    typeSelect.appendChild(createSelectOption(type.tag, type.name));
  }

  const profileOptions = document.querySelector('#profile-options');
  profileOptions.innerHTML = '';

  const profileDropdown = createDropdownItem('', ['Select', 'VBox'], 'Muunnosprofiili');
  const profileSelect = createSelectItem('profile');
  profileSelect.addEventListener('change', (event) => setTransformProfile(event, event.target.value));

  profileOptions.appendChild(profileDropdown);
  profileDropdown.appendChild(profileSelect);

  for (const profile of options.profile) {
    profileSelect.appendChild(createSelectOption(profile.tag, profile.name));
  }
}

function setTransformType(event, value) {
  console.log('Type:', value);
  const tmpTransformedOptions = dataModule.getTransformed()?.options;
  tmpTransformedOptions.type = value;
  dataModule.updateTransformed({ options: tmpTransformedOptions});
  if (!dataModule.getTransformed().base?.ID) dataModule.deleteFromTransformed('base');
  dataModule.deleteFromTransformed('stored');
  doTransform();
  return eventHandled(event);
}

function setTransformProfile(event, value) {
  console.log('Profile:', value);
  const tmpTransformedOptions = dataModule.getTransformed()?.options;
  tmpTransformedOptions.profile = value;
  dataModule.updateTransformed({ options: tmpTransformedOptions });
  if (!dataModule.getTransformed().base?.ID) dataModule.deleteFromTransformed('base');
  dataModule.deleteFromTransformed('stored');
  doTransform();
  return eventHandled(event);
}

//-----------------------------------------------------------------------------
