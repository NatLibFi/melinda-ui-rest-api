//****************************************************************************//
//                                                                            //
// Melinda Instruction url handler                                            //
//                                                                            //
//****************************************************************************//

//TODO: update clients and their help url:s accordingly
//Empty url will resolve to default
const helpUrlConfig = {
    default: "https://www.kiwi.fi/display/melinda/Ohjeet",
    viewer: "",
    muuntaja: "https://www.kiwi.fi/display/melinda/Uusi+Muuntaja+-+testiversio",
    merge: "https://www.kiwi.fi/pages/viewpage.action?pageId=77365409",
};

export { setOnHelpClicked };

/**
 * Set to element click behaviour and open clients hep url upon event, set url opening with optional openInNewtab param
 *
 * @param {object} paramObj - pass params
 * @param {String} paramObj.elementId - where to find element to attach click listener
 * @param {String} paramObj.clientName - client that requires help url
 * @param {boolean} [paramObj.openInNewTab=true] - how url should be opened, defaults to true
 */
function setOnHelpClicked(paramObj) {
    if (!paramObj || typeof paramObj !== 'object' || Object.keys(paramObj).length <= 0) {
        throw new Error('Malformed or missing param object on function');
    }
    const { elementId, clientName, openInNewTab = true } = paramObj;

    const element = document.getElementById(elementId);
    if(!element){
        console.warn('Could not set help button functionality, did not find correct element. Please see elementId given');
        return;
    }
    element.addEventListener('click', function (event) {
        onHelpClicked(clientName, openInNewTab);
    });
}

/**
 * Default click behaviour of pressing
 * @param {String} clientName
 */
function onHelpClicked(clientName, openInNewTab) {
    const url = getHelpUrlForClient(clientName);
    //new tab
    if (openInNewTab) {
        window.open(url);
        return;
    }
    //same tab
    window.location.href = url;
}

/**
 * Get help url for client.
 * @param {String} clientName - what client requests its help url
 * @returns {String} url to help wiki page
 */
function getHelpUrlForClient(clientName) {
    //check for additional output
    if (!clientName) {
        console.warn('Help Url Get did not get client name. See references. Returning default.');
        return helpUrlConfig.default;
    }
    return helpUrlConfig[clientName] !== "" ? helpUrlConfig[clientName] ?? helpUrlConfig.default : helpUrlConfig.default;
}