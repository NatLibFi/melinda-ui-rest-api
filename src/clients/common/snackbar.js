// ************************************************************************************** /
// ************************************************************************************** /
// ************************************************************************************** /
// SNACKBAR 
//
// Function for showing messages for user
//
// Use:
// - import showSnackbar to your app js from ui-utils
// - add empty div element to your app html with id 'snackbars' and class "snackbars"
// - call function with a string to create default snackbar or with a object parameter to create custom snackbar
//
// A: Default snackbar
//    * contains just the message as string
//    => showSnackbar(string)
//    => example: showSnackbar('This is my message')
//      
// B: Custom snackbar
//    * currently the options for custom snackbar are
//       - text (as string) => the message for user
//       - closeButton (as boolean) => if the button for closing snackbar should be visible or not
//    => showSnackbar({text: string, closeButton: boolean}) 
//    => example: showSnackbar({text: 'This is my message, closeButton: 'true'})




export function showSnackbar(snackbarContent) {

  if (arguments.length === 0 || snackbarContent === null) {
    console.log('Snackbar needs arguments');
    return;
  }

  getSnackbarHtml()
    .then(html =>
      createSnackbar(snackbarContent, html))
    .catch(error =>
      console.log('Error while fetching snackbar html: ', error))
}



// ************************************************************************************** //
// ************************************************************************************** //
// Fetch snackbar.html containing the template for one snackbar


async function getSnackbarHtml() {
  const response = await fetch('../common/templates/snackbar.html');
  const html = await response.text();
  return html;
}



// ************************************************************************************** //
// ************************************************************************************** //
// Creates new snackbar with given properties and add it to app's html.
//
// First clones snackbar template content to create a new snackbar element,
// then modifies snackbar element according to arguments given in parameter snackbarContent.
// After that, queries the calling app's html for div element with id 'snackbars',
// and adds the snackbar element to the element as first element.
// Also, clears the snackbars div from all snackbar elements after the (last) snackbar has displayed.


let timeoutId = null;

function createSnackbar(snackbarContent, html) {
  const snackbarElement = getNewSnackbar(html);

  const snackbarType = checkSnackbarType(snackbarContent);

  switch (true) {
    case (snackbarType === 'string'):
      createDefaultSnackbar(snackbarContent);
      break;
    case (snackbarType === 'object'):
      createCustomSnackbar(snackbarContent);
      break;
    default:
      console.log('Snackbar argument type should be string or object');
      return;
  }

  addSnackbar();
  displaySnackbar();
  clearSnackbars();


  //************************************************************************************** */
  // Helper functions for createSnackbar:

  function getNewSnackbar(html) {
    const snackbarDocument = getSnackbarDocument();
    const snackbarTemplate = snackbarDocument.getElementById('snackbarTemplate');
    const snackbarFragment = snackbarTemplate.content.cloneNode(true);
    const snackbarElement = snackbarFragment.getElementById('snackbar');
    return snackbarElement;

    function getSnackbarDocument() {
      const parser = new DOMParser();
      const snackbarDocument = parser.parseFromString(html, 'text/html');
      return snackbarDocument;
    }

  }

  function checkSnackbarType() {

    if (typeof snackbarContent === 'string' || snackbarContent instanceof String) {
      //console.log('Snackbar is an string', snackbarContent)
      return 'string';
    }

    if (typeof snackbarContent === 'object' && Object.keys(snackbarContent).length !== 0 && Object.getPrototypeOf(snackbarContent) === Object.prototype) {
      //console.log('Snackbar is an object', snackbarContent)
      return 'object';
    }
  }

  function createDefaultSnackbar(snackbarString) {
    addTextToSnackbar(snackbarString);
  }

  function createCustomSnackbar(snackbarObject) {
    const {text, closeButton} = snackbarObject;

    addTextToSnackbar(text);

    if (closeButton === 'true') {
      showCloseButtonOnSnackbar();
    }

    function showCloseButtonOnSnackbar() {
      snackbarElement.querySelector(`.snackbar-icon`).style.display = 'flex';

      snackbarElement.querySelector(`button`).addEventListener('click', () => {
        snackbarElement.style.visibility = 'hidden';
      });
    }

  }

  function addTextToSnackbar(text) {
    snackbarElement.querySelector(`.snackbar-supporting-text`).innerHTML = text;
  }

  function addSnackbar() {
    //console.log(`Prepending this snackbar element to your document's div 'snackbars': `, snackbarElement)
    const snackbarsContainer = document.getElementById('snackbars');
    snackbarsContainer.prepend(snackbarElement);
  }

  function displaySnackbar() {
    const snackbar = document.querySelector('#snackbar')

    listenToSnackbarAnimationStart();
    listenToSnackbarAnimationEnd();

    snackbar.classList.add('show-and-hide');

    function listenToSnackbarAnimationStart() {
      snackbar.onanimationstart = (event) => {
        if (event.animationName === 'fadein') {
          console.log('Now showing snackbar to user!');
        }
      }
    }

    function listenToSnackbarAnimationEnd() {
      snackbar.onanimationend = (event) => {
        if (event.animationName === 'fadeout') {
          snackbar.style.visibility = 'hidden';
          console.log('Snackbar now hidden');
        }
      }
    }

  }

  function clearSnackbars() {
    clearTimeout(timeoutId);

    // This should be accurate enough for most use cases
    timeoutId = setTimeout(() => {
      removeAllSnackbarElements();
    }, 7000)

    function removeAllSnackbarElements() {
      const snackbarsContainer = document.getElementById('snackbars');
      snackbarsContainer.replaceChildren();
      console.log('All snackbars cleared!');
    }

  }

}
