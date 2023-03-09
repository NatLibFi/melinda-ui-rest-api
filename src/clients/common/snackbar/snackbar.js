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
  const snackbarElement = getNewSnackbar(html);

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

  addSnackbar();
  displaySnackbar();


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
    console.log(`Prepending this snackbar element to your document's div 'snackbars': `, snackbarElement)
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
          console.log('Now showing snackbar to user!')
        }
      }
    }

    function listenToSnackbarAnimationEnd() {
      snackbar.onanimationend = (event) => {
        if (event.animationName === 'fadeout') {
          snackbar.style.visibility = 'hidden'
          console.log('Snackbar now hidden')
          removeOldSnackbars();
        }
      };

      function removeOldSnackbars() {
        const snackbarsContainer = document.getElementById('snackbars');
        const latestSnackbar = snackbarsContainer.firstElementChild;

        if (latestSnackbar.style.visibility === 'hidden') {
          snackbarsContainer.replaceChildren();
          console.log('All old snackbars cleared!');
        }
      }

    }

  }

}
