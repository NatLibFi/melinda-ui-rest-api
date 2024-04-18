

export {
  deleteFromTransformed,
  flipEditMode,
  getClientName,
  getEditMode,
  turnEditModeOff,
  getKeys,
  getTransformed,
  getUseProfileType,
  init,
  resetTransformed,
  updateTransformed,
  getOnNewInstanceRemoveBaseRecord
};

//for transformed data see init and initTransformed functions
let transformed, clientName, overrideOptions, clientConfigs;
window.editMode = false;
const keys = {
  source: 'source',
  base: 'base',
  insert: 'insert',
  result: 'result'
};
//-----------------------------------------------------------------------------
// Exported
//-----------------------------------------------------------------------------

function init(data = {}) {
  console.log('data module OK');
  const { client = 'muuntaja', transformedDefaultOptions = undefined, clientConfigOverride } = data;


  transformed = Object.create(initTransformed());
  editMode = false;
  clientName = client;


  //override transformed options
  if (transformedDefaultOptions) {
    transformed.options = transformedDefaultOptions;
    overrideOptions = transformedDefaultOptions;
  }
  //if configuration given override
  if(clientConfigOverride){
    clientConfigs = clientConfigOverride;
  }else{
    clientConfigs = initClientConfigs();
  }
}

//common transformed edit functions
function getTransformed() { return transformed; }
function updateTransformed(updateData) { transformed.update(updateData); }
function deleteFromTransformed(propertyPathInString) { transformed.deleteProperty(propertyPathInString); }
function resetTransformed() {
  transformed = Object.create(initTransformed());
  //override options
  if (overrideOptions) {
    transformed.options = overrideOptions;
  }
}

//common keys
function getKeys() { return keys; }

//edit mode (edit mode is globally available through window but lets try to avoid direct mutations)
function flipEditMode() { editMode = !editMode; }
function turnEditModeOff(){ editMode = false; }
function getEditMode() { return editMode; }

//other
function getClientConfigs(){return clientConfigs;}
function getFromClientConfig(configKey){return clientConfigs[configKey];}
function getUseProfileType() { return clientConfigs.canUseProfileType; }
function getOnNewInstanceRemoveBaseRecord(){return getFromClientConfig('onNewInstanceRemoveBaseRecord');}

function getClientName() { return clientName; }

//-----------------------------------------------------------------------------
// Private
//-----------------------------------------------------------------------------

/**
 * Get basic transformed object with
 *
 * @returns {object} unmodified transformed object
 */
function initTransformed() {
  return {
    options: {},
    source: null,
    base: null,
    exclude: {},
    replace: {},
    insert: [],
    //result: null,
    //stored: null,

    update(newData) {
      Object.assign(this, newData);
    },
    deleteProperty(propertyPathInString) {
      //simple object field
      if (propertyPathInString in this) {
        delete this[propertyPathInString];
        return;
      }

      //nested property
      const propertiesInPath = propertyPathInString.split('.');
      let currentObj = this;
      for (const property of propertiesInPath.slice(0, -1)) {
        if (!(property in currentObj)) {
          //console.log(`Nested property '${propertyPathInString}' does not exist.`);
          return;
        }
        currentObj = currentObj[property];
      }
      delete currentObj[propertiesInPath[propertiesInPath.length - 1]];
    }
  };
}

/**
 * default to 'muuntaja' client settings
 * this is more of a reminder what settings can be used
 * @returns {object} - clientconfig init data
 */
function initClientConfigs(){
  return {
    canUseProfileType: true,
    onNewInstanceRemoveBaseRecord: false
  };
}

