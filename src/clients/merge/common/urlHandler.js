import * as dataModule from '/merge/common/dataHandler.js';

export {
    parseUrlParameters, updateUrlParameters, init
};

//-----------------------------------------------------------------------------
// Exported
//-----------------------------------------------------------------------------
function init() { console.log('url module OK'); }

/**
 * Parse data from url parameters
 * get data from url parameters (has defaults) and sets id to source and bas
 * IF profile and type are enabled set updates type and profile dropdown selector and update transformed options from them
 */
function parseUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const sourceId = urlParams.get('sourceId') || '';
    const baseId = urlParams.get('baseId') || '';


    document.querySelector('.record-merge-panel #source #ID').defaultValue = sourceId;
    document.querySelector('.record-merge-panel #base #ID').defaultValue = baseId;

    //only read additional parameters if prompted by client to do so
    if (dataModule.getUseProfileType()) {
        const type = urlParams.get('type') || 'p2e';
        const profile = urlParams.get('profile') || 'DEFAULT';

        document.querySelector('#type-options [name=\'type\']').value = type;
        document.querySelector('#profile-options [name=\'profile\']').value = profile;

        dataModule.updateTransformed({
            options: {
                type: type,
                profile: profile
            }
        });
    }
}

/**
 * Updates pages url search params.
 * empty seach defaults to client name provided
 * dataModule.getUseProfileType() variable configures if profile and type are available in url params
 *
 * @param {object} transformed transformed dataobject
 */
function updateUrlParameters(transformed) {
    //clear whole url search param stack
    //not passing window.location.search to search params we are resetting all params, param reads should have happened by now already
    const urlParams = new URLSearchParams();

    const { options, source, base } = transformed;

    const urlParamConfigs = [
        { id: "type", defaultPosition: 1, value: options?.type, isActive: dataModule.getUseProfileType() },
        { id: "profile", defaultPosition: 2, value: options?.profile, isActive: dataModule.getUseProfileType() },
        { id: "baseId", defaultPosition: 4, value: base?.ID, isActive: true },
        { id: "sourceId", defaultPosition: 3, value: source?.ID, isActive: true }
    ];
    //filer not needed ones out, (those with not value or not active are left out)
    const filteredParamConfigs = urlParamConfigs.filter(obj => (obj.isActive && obj.value));
    //order by position
    filteredParamConfigs.sort((a, b) => a.defaultPosition - b.defaultPosition);
    //set param values
    for (const urlParam of filteredParamConfigs) {
        urlParams.set(urlParam.id, urlParam.value)
    }

    //handle state
    window.history.replaceState({}, '', decodeURIComponent(`${window.location.pathname}?${urlParams}`));
    if (window.location.search === '') {
        window.history.replaceState({}, '', `/${dataModule.getClientName()}/`);
    }
}

//-----------------------------------------------------------------------------
// Private
//-----------------------------------------------------------------------------
