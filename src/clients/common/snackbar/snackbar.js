//**********// 
// SNACKBAR //
//**********//

// Function for showing pop-up messages for user
//
// Use:
// - import showSnackbar to your app js from ui-utils
// - add empty div element to your app html with id 'snackbars'
// - call function with string to create default snackbar or with object parameter to create custom snackbar
//      - showSnackbar(string) => showSnackbar('This is my message')
//      - showSnackbar(object={text, closeButton}) => showSnackbar({text: 'This is my message, closeButton: 'true'})
// 
// - currently the options for custom snackbar are
//    * text (as string) => the message for user
//    * closeButton (as boolean) => if the button for closing snackbar should be visible or not
//
export function showSnackbar(snackbarContent) {

  if (arguments.length === 0 || snackbarContent === null) {
    console.log('Snackbar needs arguments')
    return;
  }

  getSnackbarHtml()
    .then(html =>
      createSnackbar(snackbarContent, html)
    );

}

// Fetch snackbar.html containing the template for one snackbar
async function getSnackbarHtml() {
  const response = await fetch('../common/snackbar/snackbar.html');
  const html = await response.text();
  return html;
}

// Creates new snackbar with given properties and add it to app's html.
//
// First clones snackbar template content to create a new snackbar element,
// then modifies snackbar element according to arguments given parameter snackbarContent,
// then finally queries the calling app's html for div element with id 'snackbars',
// and adds the snackbar element to the element as first element
//
function createSnackbar(snackbarContent, html) {
  const snackbar = getNewSnackbar(html);

  const snackbarType = checkSnackbarType(snackbarContent)
  switch (true) {
    case (snackbarType === 'string'):
      createDefaultSnackbar(snackbarContent);
      break;
    case (snackbarType === 'object'):
      createCustomSnackbar(snackbarContent);
      break;
    default:
      console.log('Snackbar argument type should be string or object')
      return;
  }

  addSnackbar(snackbar);

  function getNewSnackbar(html) {
    const snackbarDocument = getSnackbarDocument();
    const snackbarTemplate = snackbarDocument.getElementById('snackbarTemplate');
    const snackbarFragment = snackbarTemplate.content.cloneNode(true);
    return snackbarFragment.getElementById('snackbar');

    function getSnackbarDocument() {
      const parser = new DOMParser();
      const snackbarDocument = parser.parseFromString(html, 'text/html');
      return snackbarDocument;
    }

  }

  function checkSnackbarType() {

    if (typeof snackbarContent === 'string' || snackbarContent instanceof String) {
      console.log('Snackbar is an string', snackbarContent)
      return 'string';
    }

    if (typeof snackbarContent === 'object' && Object.keys(snackbarContent).length !== 0 && Object.getPrototypeOf(snackbarContent) === Object.prototype) {
      console.log('Snackbar is an object', snackbarContent)
      return 'object'
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

  }

  function addTextToSnackbar(text) {
    snackbar.querySelector(`.snackbar-supporting-text`).innerHTML = text;
  }

  function showCloseButtonOnSnackbar() {
    snackbar.querySelector(`.snackbar-icon`).style.display = 'flex';

    snackbar.querySelector(`button`).addEventListener('click', () => {
      snackbar.style.display = 'none';
    });
  }

  function addSnackbar(snackbar) {
    console.log('Prepending this snackbar to your document: ', snackbar)
    const snackbarsContainer = document.getElementById('snackbars');
    snackbarsContainer.prepend(snackbar);
  }

}
