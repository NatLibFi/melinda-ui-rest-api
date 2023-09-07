import {
  enableElement, disableElement, highlightElement,
  getAllDescendants, showSnackbar
} from '/common/ui-utils.js';

import {idbGetLogs} from '/viewer/indexDB.js';
import {setDataToIndexDB} from './viewer.js'


//-----------------------------------------------------------------------------------------
// Functions for file dialog: file upload and file download for merge records
//-----------------------------------------------------------------------------------------

export default function () {
  return {checkFile}
}

window.downloadFile = function (event) {
  console.log('Downloading file...');
  eventHandled(event);

  const correlationId = document.querySelector(`#viewer #id`).value;
  const sequence = document.querySelector(`#viewer #sequence`).value;
  const recordObject = new Object();

  idbGetLogs(sequence)
    .then((data) => {

      if (data.logItemType !== 'MERGE_LOG' && data.logItemType !== 'MATCH_LOG') {
        throw new Error('Wrong log item type (should be MERGE_LOG or MATCH_LOG)');
      }

      if (data.logItemType === 'MERGE_LOG') {
        setPreferred(data.preference);
        setIncomingRecord(data.incomingRecord);
        setMelindaRecord(data.databaseRecord);
        setMergedRecord(data.mergedRecord);
        setCreationTime(data.creationTime);
      }

      if (data.logItemType === 'MATCH_LOG') {
        setIncomingRecord(data.incomingRecord);
        setMatchedRecord(data.matchResult[0]);
        setMatcherReports(data.matchResult[0]);
        setCreationTime(data.creationTime);
      }

      doDownload(JSON.stringify(recordObject));
      showSnackbar({style: 'success', text: 'Tiedosto ladattiin onnistuneesti laitteellesi!'});
    })
    .catch((error) => {
      console.log('Problem getting or setting log data while creating record object: ', error);
      showSnackbar({style: 'error', text: 'Tiedostoa ei valitettavasti pystytty lataamaan'});
    });

  function setPreferred(preference) {
    if (preference.recordName === 'databaseRecord') {
      recordObject.preferred = 'melindaRecord';
      return;
    }

    recordObject.preferred = preference.recordName;
  }

  function setIncomingRecord(record) {
    recordObject.incomingRecord = record;
  }

  function setMelindaRecord(record) {
    recordObject.melindaRecord = record;
  }

  function setMergedRecord(record) {
    recordObject.mergedRecord = record;
  }

  function setMatchedRecord(result) {
    recordObject.matchedRecord = result?.candidate.record ?? {};
  }

  function setMatcherReports(result) {
    recordObject.matcherReport = {};
    recordObject.matcherReport.melindaId = result?.candidate.id;
    recordObject.matcherReport.action = result?.action;
    recordObject.matcherReport.probability = result?.probability;
    recordObject.matcherReport.preferenceRecord = result?.preference;
  }

  function setCreationTime(time) {
    recordObject.creationTime = time;
  }

  function doDownload(fileContent) {
    const fileName = `${correlationId}_${sequence}.json`;

    const linkElement = document.createElement('a');
    linkElement.download = fileName;
    linkElement.href = `data:attachment/text,${encodeURI(fileContent)}`;
    linkElement.click();
  }
};

window.uploadFile = function (event) {
  const dialog = document.getElementById('dialogForUpload');
  dialog.showModal();
};

window.showInstructions = function (event) {
  eventHandled(event);
  const instructions = document.getElementById('instructions');
  const hideButton = document.getElementById('hideInstructionsButton');
  const showButton = document.getElementById('showInstructionsButton');

  instructions.style.display = 'block';
  showButton.style.display = 'none';
  hideButton.style.display = 'flex';
};

window.hideInstructions = function (event) {
  eventHandled(event);
  const instructions = document.getElementById('instructions');
  const hideButton = document.getElementById('hideInstructionsButton');
  const showButton = document.getElementById('showInstructionsButton');

  instructions.style.display = 'none';
  showButton.style.display = 'flex';
  hideButton.style.display = 'none';
};

window.openFileBrowse = function (event) {
  eventHandled(event);
  const fileInput = document.getElementById('fileUpload');
  fileInput.click();
};

window.clearSelectedFile = function (event) {
  eventHandled(event);
  const fileInput = document.getElementById('fileUpload');
  fileInput.value = '';
  return fileInput.dispatchEvent(new Event('change'));
};

window.cancelUpload = function (event) {
  console.log('File upload cancelled');
  showSnackbar({style: 'status', text: 'Tiedoston avaaminen peruttu'});
};

window.confirmUpload = function (event) {
  const file = document.getElementById('fileUpload').files[0];
  const reader = new FileReader();

  clearLogView();

  if (file) {
    console.log(`Trying to read file ${file.name}...`);
    reader.readAsText(file, 'UTF-8');

    reader.onload = function (event) {
      const fileContent = event.target.result;
      const json = parseJson(fileContent);
      const log = parseLog(json);

      if (log) {
        console.log('Log parsed from file: ', log);
        setDataToIndexDB({0: log}, 0);
        showReaderMode();
        showSnackbar({style: 'info', text: 'Jos tietueissa on puutteita, tarkista aina myös lataamasi tiedoston laatu.'});
      }
    };

    reader.onerror = function (event) {
      console.log('Error reading file ', error);
      showSnackbar({style: 'error', text: 'Valitettavasti tiedoston avaus ei onnistunut!'});
    };

    function parseJson(text) {
      let data = null;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch (error) {
          console.log('Error while parsing file content to JSON: ', error);
          showSnackbar({style: 'error', text: 'Tietueita ei voitu avata lukunäkymään, tarkista tiedosto'});
        }
      }

      return data;
    }

    function parseLog(data) {
      if (data === null) {
        console.log('No json data for parsing log');
        showSnackbar({style: 'error', text: 'Tietueita ei voitu avata lukunäkymään, tarkista tiedosto'});
        return;
      }

      if (data.melindaRecord === undefined && data.databaseRecord === undefined && data.mergedRecord === undefined && data.incomingRecord === undefined) {
        console.log('Records are undefined, invalid json data for parsing log');
        showSnackbar({style: 'error', text: 'Tietueita ei voitu avata lukunäkymään, tarkista tiedosto'});
        return;
      }

      const log = {...data};
      log.logItemType = 'MERGE_LOG';
      log.blobSequence = 0;
      log.creationTime = data.creationTime || 'Ei saatavilla';
      log.databaseRecord = data.melindaRecord || data.databaseRecord;
      log.preference = {recordName: (data.preferred === 'melindaRecord' ? 'databaseRecord' : data.preferred) || ''};
      delete log.melindaRecord;
      delete log.preferred;
      return log;
    }
  }
};

window.exitReaderMode = function (event) {
  console.log('Exiting Viewer reader mode');
  eventHandled(event);

  const toolbar = document.getElementById('viewerTools');
  const allElements = getAllDescendants(toolbar);

  allElements.forEach(element => enableElement(element));

  const readMode = document.getElementById('readMode');
  readMode.style.display = 'none';

  const exitButton = document.getElementById('exit');
  disableElement(exitButton);
  exitButton.style.display = 'none';

  clearLogView();
};

function showReaderMode() {
  console.log('Viewer is now in reader mode: records are read only');

  const sequenceInputField = document.getElementById('sequenceInput');
  const sequenceSelect = document.getElementById('sequence');
  sequenceInputField.style.display = 'block';
  sequenceSelect.style.display = 'none';

  const toolbar = document.getElementById('viewerTools');
  const allElements = getAllDescendants(toolbar);
  allElements.forEach(element => disableElement(element));

  const uploadButton = document.getElementById('import');
  enableElement(uploadButton);

  const exitButton = document.getElementById('exit');
  exitButton.style.display = 'flex';
  enableElement(exitButton);

  const readMode = document.getElementById('readMode');
  readMode.style.display = 'flex';
}

export function checkFile(file) {
  console.log('Checking uploaded file...');
  const confirmUploadButton = document.getElementById('confirmUploadButton');
  const fileNameDiv = document.getElementById('selectedFileName');

  if (!file) {
    console.log('No file to check!');
    disableElement(confirmUploadButton);
    return;
  }

  if (file.size === 0) {
    console.log('File is empty!');
    disableElement(confirmUploadButton);
    highlightElement(fileNameDiv, 'var(--color-functional-red)');
    showSnackbar({style: 'alert', text: 'Tyhjää tiedostoa ei voi avata, tarkista tiedoston sisältö!'});
    return;
  }

  if (file.type !== 'application/json' && file.type !== 'text/plain') {
    console.log(`File type '${file.type}' is not accepted for upload!`);
    confirmUploadButton.title = 'Valitse ensin .json- tai .txt-päätteinen tiedosto';
    disableElement(confirmUploadButton);
    highlightElement(fileNameDiv, 'var(--color-functional-red)');
    showSnackbar({style: 'alert', text: 'Vain .json- tai .txt-tiedostot hyväksytään, tarkista tiedoston tyyppi!'});
    return;
  }

  confirmUploadButton.removeAttribute('title');
  enableElement(confirmUploadButton);
  highlightElement(fileNameDiv, 'var(--color-functional-green)');
}
