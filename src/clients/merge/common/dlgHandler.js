import * as jsonModule from '/merge/common/jsonHandler.js';

export {
    init
};

//-----------------------------------------------------------------------------
// Exported
//-----------------------------------------------------------------------------
function init(){}
/**
 * Set in ui dialog visible and show record type
 *
 * @param {object} object - data set trough object
 * @param {string} object.recordType - record type that was not found
 */
window.notFoundDlgOpen = function(event, recordType) {
    const dlg = document.querySelector('#notFoundDlg');
    dlg.style.display = 'flex';
    const prefix = document.querySelector('#notFoundDlg #recordType');
    prefix.innerHTML = recordType;
    return eventHandled(event);
}
window.notFoundDlgClose = function (event) {
    const dlg = document.querySelector('#notFoundDlg');
    dlg.style.display = 'none';
    return eventHandled(event);
}
window.jsonDlgOpen = function (event) {
const dlg = document.querySelector('#jsonDlg');
dlg.style.display = 'flex';
const content = document.querySelector('#jsonDlg #jsonContent');
content.innerHTML = '';
content.appendChild(jsonModule.createJsonInput({ id: 'recordAsJson', className: 'recordAsJson', content: JSON.stringify(dataModule.getTransformed(), null, 1) }));
}
window.jsonDlgClose = function (event) {
const dlg = document.querySelector('#jsonDlg');
dlg.style.display = 'none';
return eventHandled(event);
}
//-----------------------------------------------------------------------------
// Private
//-----------------------------------------------------------------------------
