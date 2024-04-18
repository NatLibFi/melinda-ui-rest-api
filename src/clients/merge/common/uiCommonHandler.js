import { logout } from '/common/auth.js';
import { editField } from '/common/marc-record-ui.js';

import {
    resetForms, showNotification
} from '/common/ui-utils.js';
import * as dataModule from '/merge/common/dataHandler.js';
import * as uiEditModule from '/merge/common/uiEditHandler.js';
import * as urlModule from '/merge/common/urlHandler.js';


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
//+ button, new operation
window.onNewInstance = function (event) {

    const sourceInput = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #source #ID`);
    sourceInput.value = '';
    sourceInput.dispatchEvent(new Event('input'));

    //if client wants to, remove also base record
    if (dataModule.getOnNewInstanceRemoveBaseRecord()) {
        const baseInput = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #base #ID`);
        baseInput.value = '';
        baseInput.dispatchEvent(new Event('input'));
    }

    //if edit mode is still on turn it off
    if (dataModule.getEditMode()) {
        uiEditModule.turnEditModeOff();
    }

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

    urlModule.updateUrlParameters();
    const url = window.location.href;
    navigator.clipboard.writeText(url);

    showNotification({ componentStyle: 'banner', style: 'success', text: 'Linkki kopioitu!' });
}


//-----------------------------------------------------------------------------
// Private
//-----------------------------------------------------------------------------


