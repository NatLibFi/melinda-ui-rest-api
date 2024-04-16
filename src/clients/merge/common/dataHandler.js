

export {
    deleteFromTransformed,
    flipEditMode,
    getClientName,
    getEditMode,
    getKeys,
    getTransformed,
    getUseProfileType,
    init,
    resetTransformed,
    updateTransformed
};

//for transformed data see init and initTransformed functions
let transformed, useProfileType, clientName, overrideOptions;
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

function init(data = {}){
    const { canUseProfileType = true, transformedDefaultOptions = undefined, client = 'muuntaja' } = data;

    transformed = Object.create(initTransformed());
    editMode = false;
    useProfileType = canUseProfileType;
    clientName = client;

    //override options
    if (transformedDefaultOptions) {
        transformed.options = transformedDefaultOptions;
        overrideOptions = transformedDefaultOptions;
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
function getKeys(){return keys;}

//edit mode (edit mode is globally available through window but lets try to avoid direct mutations)
function flipEditMode(){editMode = !editMode;}
function getEditMode(){return editMode;}

//other get
function getUseProfileType(){return useProfileType;}
function getClientName(){return clientName;}

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

