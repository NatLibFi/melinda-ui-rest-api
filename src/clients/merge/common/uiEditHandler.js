
import { editField } from '/common/marc-record-ui.js';
import { storeTransformedRequest } from '/common/rest.js';
import {
    startProcess, stopProcess
} from '/common/ui-utils.js';

import * as dataModule from '/merge/common/dataHandler.js';

export {
    init, onEditClick, onFieldToggleClick, turnEditModeOff
};


//-----------------------------------------------------------------------------
// Exported
//-----------------------------------------------------------------------------
function init() { console.log('ui edit module OK'); }

/**
 * Clicking the records field, toggles it on/off
 *
 * @param {Event} event - on clicking the field data
 * @param {object} field - field data
 */
function onFieldToggleClick(event, field) {
    const { id } = field;
    console.log(`Toggle Click on ${id}`);

    if (id) {
        const insertData = dataModule.getTransformed().insert;
        const isInserted = insertData.filter(f => f.id === id).length > 0

        if (isInserted) {
            dataModule.updateTransformed({
                insert: [
                    ...insertData.filter(f => f.id !== id),
                ]
            });
        } else if (!dataModule.getTransformed().exclude[id]) {
            const exclude = dataModule.getTransformed().exclude;
            exclude[id] = true;
            dataModule.updateTransformed({
                exclude: exclude
            });
        } else {
            const deletePath = `exclude.${id}`;
            dataModule.deleteFromTransformed(deletePath);
        }

        doTransform();
    }
}
// Field view decorator
/**
 * Clicking on (edit enabled) the record field.
 *
 * @param {Event} event - on clicking the field data
 * @param {object} field - field data
 * @param {object} original - result of reduction in showTransformed getLookup. Essentially object with fields array values as sub objects with each objects id field value set objects field key
 * @returns {boolean} True if the event was handled, false otherwise.
 */
function onEditClick(event, field, original) {
    const { id } = field;
    console.log(`Edit Click on ${id}`);

    //returns sub element of the field clicked, if no specific subelement it returns just row row-fromBase
    //span uses as class classname/id
    var subElement = null;
    try {
        subElement = {};
        subElement.class = event.originalTarget.attributes.class.nodeValue;
        subElement.index = parseInt(event.originalTarget.attributes.index.nodeValue);
    } catch (error) {
        console.log(`Getting field sub element encountered error: ${error}.`);
        console.log('Or maybe user clicked on some parent element without required attributes. Skipping preactivation for a spesific value.');
        subElement = null;
    }
    //make sure only certain values can be auto edit focus requested
    //if not correct later expects null and does nothing
    if (subElement && !isSubElementAcceptable(subElement.class)) {
        console.log(`Fields sub element ${subElement.class} is not acceptable for pre activation`);
        subElement = null;
    }

    editField(field, original, subElement);

    return eventHandled(event);

    function isSubElementAcceptable(elementRequested) {
        switch (elementRequested) {
            case 'tag':
            case 'ind1':
            case 'ind2':
            case 'code':
            case 'value':
                return true;
            default:
                return false;
        }
    }
}

//window functions dont get exported
window.onEdit = function (event) {
    console.log('Edit:', event);
    dataModule.flipEditMode();

    styleResultPanelBasedOnEditState();
    showTransformed(null);
    return eventHandled(event);
}
window.editSaveField = function (field) {
    //-----------------------------------------------------------------------------
    // Saving edited field: if field is in source or base, add a replace rule.
    // If it is in insert array, replace it from there. If it has no ID, add
    // it to insert array.
    //-----------------------------------------------------------------------------

    console.log('Saving field:', field);

    const { id } = field
    const insertValue = dataModule.getTransformed().insert;

    if (!id) {
        dataModule.updateTransformed({
            insert: [
                ...insertValue,
                field
            ]
        });
    } else {
        const isInserted = dataModule.getTransformed().insert.filter(f => f.id === id).length > 0
        if (isInserted) {
            dataModule.updateTransformed({
                insert: [
                    ...insertValue.filter(f => f.id !== id),
                    field
                ]
            });
        } else {
            const replaceValue = dataModule.getTransformed().replace;
            replaceValue[field.id] = field;
            dataModule.updateTransformed({
                replace: replaceValue
            });
        }
    }
    doTransform();
}
window.editUseOriginal = function (field) {
    const deletePath = `replace.${field.id}`;
    dataModule.deleteFromTransformed(deletePath);
    doTransform();
}
window.onClearEdits = function (event) {
    dataModule.updateTransformed({
        insert: [],
        exclude: {},
        replace: {}
    });

    doTransform()
    return eventHandled(event);
}
window.onSave = function (event) {
    //console.log("Save:", event)

    // Do transform

    startProcess();

    console.log("Storing:", dataModule.getTransformed())

    storeTransformedRequest(dataModule.getTransformed())
        .then(response => response.json())
        .then(records => {
            stopProcess();
            console.log('Transformed:', records);
            showTransformed(records);
        });

    return eventHandled(event);
}

function styleResultPanelBasedOnEditState() {
    const originalStyle = getComputedStyle(document.querySelector('.record-merge-panel'));
    const borderStyleActive = "solid";
    const borderColorActive = originalStyle.getPropertyValue('--color-melinda-green-custom');

    //use .record-merge-panel #source/#base/#result #some-sub-id/.some-sub-class
    const resultPanel = document.querySelector('.record-merge-panel #result ');
    const editButton = document.querySelector('.record-merge-panel #edit-button');

    if (dataModule.getEditMode()) {
        editButton.classList.add('edit-mode');
        resultPanel.style.borderStyle = borderStyleActive;
        resultPanel.style.borderColor = borderColorActive;
        resultPanel.style.borderWidth = "2px";
    }
    else {
        editButton.classList.remove('edit-mode');
        resultPanel.style.borderStyle = "initial";
    }
}

/**
 * Updates edit mode data and updates visual to correspond to it
 */
function turnEditModeOff() {
    dataModule.turnEditModeOff();
    styleResultPanelBasedOnEditState();
}



//-----------------------------------------------------------------------------
// Private
//-----------------------------------------------------------------------------


