import { logout } from '/common/auth.js';
import { editField } from '/common/marc-record-ui.js';

import {
    resetForms, showNotification
} from '/common/ui-utils.js';


export {
    init
};


//-----------------------------------------------------------------------------
// Exported
//-----------------------------------------------------------------------------
function init() { console.log('ui common module OK'); }

window.onNew = function (event) {
    console.log('New:', event);
    resetForms(document.getElementById(dataModule.getClientName()));
    return eventHandled(event);
}
window.onNewField = function (event) {
    editField({
        tag: '', ind1: '', ind2: '',
        subfields: []
    });
    return eventHandled(event);
}
window.onNewInstance = function (event) {

    const sourceInput = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #source #ID`);
    sourceInput.value = '';
    sourceInput.dispatchEvent(new Event('input'));

    //set content
    doTransform();
}
window.onSearch = function (event) {
    console.log('Search:', event);
    //const dialog = document.getElementById('searchDlg');
    //console.log('Dialog:', dialog);
    //dialog.show();
}
window.onRecordSwap = function (event) {

    const sourceInput = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #source #ID`);
    const baseInput = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #base #ID`);

    console.log('Swap:ing between source and base');

    //swap id:s
    const originalSourceId = sourceInput.value;
    const originalBaseId = baseInput.value;

    sourceInput.value = originalBaseId;
    baseInput.value = originalSourceId;

    //trigger input event listener to update required values (ie. url parameters)
    sourceInput.dispatchEvent(new Event('input'));
    baseInput.dispatchEvent(new Event('input'));

    //swap records around
    if (dataModule.getTransformed()) {
        const trans = dataModule.getTransformed();
        const sourceData = trans.source;
        const baseData = trans.base;

        dataModule.updateTransformed({
            source: baseData,
            base: sourceData
        });

        doTransform();
    }

    return eventHandled(event);
}
window.onSettings = function (event) {
    console.log('Settings:', event);
    return eventHandled(event);
}
window.onAccount = function (event) {
    console.log('Account:', event);
    logout();
}
window.copyLink = function (event) {
    eventHandled(event);

    const type = dataModule.getUseProfileType() ? document.querySelector('#type-options [name=\'type\']').value : dataModule.getTransformed()?.options?.type;
    const profile = dataModule.getUseProfileType() ? document.querySelector('#profile-options [name=\'profile\']').value : dataModule.getTransformed()?.options?.profile;
    let leadingChar = '';

    if (window.location.href.includes('?')) {
        if (window.location.search !== '') {
            leadingChar = '&';
        }
    } else {
        leadingChar = '?';
    }

    navigator.clipboard.writeText(`${window.location}${leadingChar}type=${type}&profile=${profile}`);

    showNotification({ componentStyle: 'banner', style: 'success', text: 'Linkki kopioitu!' });
}


//-----------------------------------------------------------------------------
// Private
//-----------------------------------------------------------------------------


