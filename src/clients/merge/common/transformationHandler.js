import { showRecord } from '/common/marc-record-ui.js';
import { transformRequest } from '/common/rest.js';
import {
    startProcess, stopProcess
} from '/common/ui-utils.js';

import * as dataModule from '/merge/common/dataHandler.js';
import * as uiEditModule from '/merge/common/uiEditHandler.js';
import * as urlModule from '/merge/common/urlHandler.js';

export {
    init
};

//-----------------------------------------------------------------------------
// info needed for muuntaja merge REST call:
// - Base record
// - Transform options
// - Source record
// - Field selections
// - User edits
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Exported
//-----------------------------------------------------------------------------
function init() { console.log('transformation module OK'); }

window.doTransform = function (event = undefined) {
    console.log('Transforming');
    if (event) {
        event.preventDefault();
    }

    //console.log('Source ID:', sourceID);
    //console.log('Base ID:', baseID);

    const sourceID = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #source #ID`).value;
    const baseIDString = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #base #ID`).value;

    const baseID = baseIDString ? baseIDString : undefined

    //exception, if source and base ids are the same inform user, ignore empty searches

    if (sourceID && baseID && sourceID === baseID) {
        console.log('Source and base ID:s match. This is not permitted');
        alert('Lähde ja Pohja tietueet eivät voi olla samat');
        return;
    }

    // If source is changed, clear the corresponding records and all the edits
    if (sourceID != dataModule.getTransformed()?.source?.ID) {
        console.log("Source ID mismatch:", sourceID, "!==", dataModule.getTransformed()?.source?.ID)
        const tmpTransformed = dataModule.getTransformed();
        dataModule.resetTransformed();
        dataModule.updateTransformed({
            options: tmpTransformed.options,
            base: tmpTransformed.base,
            source: { ID: sourceID }
        });
    }

    if (!dataModule.getTransformed().base || baseID !== dataModule.getTransformed().base.ID) {
        console.log("Base ID mismatch")
        dataModule.updateTransformed({
            base: { ID: baseID }
        });
        dataModule.deleteFromTransformed('stored');
    }

    // Do transform
    console.log('Transforming:', dataModule.getTransformed());

    startProcess();

    transformRequest(dataModule.getTransformed())
        .then(response => response.json())
        .then(records => {
            stopProcess();
            console.log('Transformed:', records);
            showTransformed(records);
        });
}
/**
 * Main function for showing transformed data on ui
 * TODO: add more description
 * - resets and updates transformed with update data
 * - get fields and handle id data bundling
 * - show record for source, base and result
 * - udpates different button states based on current state
 *
 * @param {object} [update=undefined] - update object for updating transformed object, defaults to undefined
 */
window.showTransformed = function (update = undefined) {
    //TODO: should the update handled elsewhere separetely and not updated here ?
    //updateTransformed(update);
    if (update) {
        dataModule.resetTransformed();
        dataModule.updateTransformed({
            ...update
        });
    }

    const { source, base, insert, stored, result } = dataModule.getTransformed();

    const isStored = !!stored

    // Get field source for decorator
    const sourceFields = getFields(source);
    const baseFields = getFields(base);
    const addedFields = insert;
    const resultFields = getFields(result);
    const storedFields = getFields(stored);

    const resultIDs = resultFields.filter(f => !!f.id).map(f => f.id);
    const includedSourceIDs = sourceFields.map(f => f.id).filter(id => resultIDs.includes(id));
    const includedBaseIDs = baseFields.map(f => f.id).filter(id => resultIDs.includes(id));
    const includedAddedIDs = addedFields.map(f => f.id).filter(id => resultIDs.includes(id));

    const from = {
        ...includedSourceIDs.reduce((a, id) => ({ ...a, [id]: dataModule.getKeys().source }), {}),
        ...includedBaseIDs.reduce((a, id) => ({ ...a, [id]: dataModule.getKeys().base }), {}),
        ...includedAddedIDs.reduce((a, id) => ({ ...a, [id]: dataModule.getKeys().insert }), {})
    };

    const original = getLookup(sourceFields.concat(baseFields).concat(storedFields));

    //console.log(dataModule.getTransformed().from)

    // Show records
    showRecord(source, dataModule.getKeys().source, {
        onClick: uiEditModule.onFieldToggleClick,
        from,
        exclude: dataModule.getTransformed().exclude
    }, dataModule.getClientName());
    showRecord(base, dataModule.getKeys().base, {
        onClick: uiEditModule.onFieldToggleClick,
        from,
        exclude: dataModule.getTransformed().exclude
    }, dataModule.getClientName());
    showRecord(result, dataModule.getKeys().result, {
        onClick: (dataModule.getEditMode() || isStored) ? uiEditModule.onEditClick : uiEditModule.onFieldToggleClick,
        onDelete: uiEditModule.onFieldToggleClick,
        from,
        original,
        exclude: dataModule.getTransformed().exclude,
        replace: dataModule.getTransformed().replace,
        insert: dataModule.getTransformed().insert
    }, dataModule.getClientName());

    // Update UI states according to result
    urlModule.updateUrlParameters(dataModule.getTransformed());
    updateRecordSwapButtonState();
    updateSaveButtonState(dataModule.getTransformed());
    updateEditButtonState(dataModule.getTransformed())
    updateResultID(dataModule.getTransformed());

    function getFields(record) {
        return record?.fields ?? [];
    }
    function getLookup(fields) {
        return fields.reduce((a, field) => ({ ...a, [field.id]: field }), {});
    }
    function updateResultID(transformed) {
        const { result } = transformed
        const resultID = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #result #ID`)

        //console.log("Stored:", stored)

        if (result?.ID) {
            resultID.textContent = "TIETUE " + result?.ID
        } else {
            resultID.textContent = "TULOSTIETUE"
        }
    }
    function updateSaveButtonState(transformed) {
        const { result } = transformed

        const savebtn = document.getElementById("save-button")
        if (result.ID || (result?.leader)) {
            savebtn.disabled = false
        } else {
            savebtn.disabled = true
        }
    }
    function updateEditButtonState(transformed) {
        const { stored } = transformed
        const editbtn = document.getElementById("edit-button")

        if (stored) {
            editbtn.disabled = true
        } else {
            editbtn.disabled = false
        }
    }
    function updateRecordSwapButtonState() {
        const sourceID = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #source #ID`).value;
        const baseID = document.querySelector(`#${dataModule.getClientName()} .record-merge-panel #base #ID`).value;

        document.getElementById('swap-button').disabled = !sourceID || !baseID;
    };
}


//-----------------------------------------------------------------------------
// Private
//-----------------------------------------------------------------------------



