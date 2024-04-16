export {
    createJsonInput, init
};

//-----------------------------------------------------------------------------
// Exported
//-----------------------------------------------------------------------------
function init() { console.log('json module OK'); }

window.selectJson = function (event) {
    const record = document.querySelector('#recordAsJson');
    if (document.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(record);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(record);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}
window.saveJson = function sharedSaveJson(event) {
    const record = document.querySelector('#recordAsJson');
    dataModule.resetTransformed();
    dataModule.updateTransformed(JSON.parse(record.textContent));
    doTransform();
    if (dataModule.getUseProfileType()) {
        document.querySelector('#type-options [name=\'type\']').value = dataModule.getTransformed().options.type;
        document.querySelector('#profile-options [name=\'profile\']').value = dataModule.getTransformed().options.profile;
    }
    jsonDlgClose(event);
}
/**
 * Creates a preformatted text element, sets some data to its attribute and classList
 *
 * @param {object} object - data set trough object
 * @param {object} object.id - record id
 * @param {object} object.className - any class you want to add to elements classList
 * @param {string} object.content - json as text
 * @param {boolean} [object.editable=true] - should the text be editable
 * @returns {HTMLElement} created input '<pre>' element (preformatted text element)
 */
function createJsonInput({ id, className, content, editable = true }) {
    const input = document.createElement('pre');
    input.setAttribute('id', id);
    input.classList.add(className);
    if (editable) {
        input.classList.add('editable');
    }
    input.textContent = content;
    input.contentEditable = editable;
    return input;
}
//-----------------------------------------------------------------------------
// Private
//-----------------------------------------------------------------------------
