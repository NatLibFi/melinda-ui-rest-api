//****************************************************************************//
//                                                                            //
// Melinda navigation bar custom element for apps                             //
//                                                                            //
//****************************************************************************//

class Navbar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {

    getNavbarHtml()
      .then(html => {
        const navbar = getNavbarElement(html);
        this.appendChild(navbar);
        console.log('Navbar is added: ', navbar.isConnected);
        addNavbarEventListeners();
        addFauxBreadcrumb();
      })
      .catch(error =>
        console.log('Error while setting navbar: ', error)
      )

    async function getNavbarHtml() {
      const response = await fetch('/../common/templates/navbar.html');
      const html = await response.text();
      return html;
    }

    function getNavbarElement(html) {
      const parser = new DOMParser();
      const navbarDocument = parser.parseFromString(html, 'text/html');
      const navbarTemplate = navbarDocument.getElementById('navbarTemplate');
      const navbarFragment = navbarTemplate.content.cloneNode(true);
      const navbarElement = navbarFragment.getElementById('navbar');
      return navbarElement;
    }

    // Add event listeners for navbar related functions
    function addNavbarEventListeners() {
      console.log('Adding navbar event listeners');

      const dropdownMenuButtons = document.querySelectorAll('.navbar-dropdown-button');
      const dropdownCloseButtons = document.querySelectorAll('.dropdown-button-close');

      dropdownMenuButtons.forEach(button => {
        addDropdownMenuEventListener(button);
      });

      dropdownCloseButtons.forEach(button => {
        addDropdownCloseButtonEventListener(button);
      });

      addDismissNavbarEventListener();


      // Toggles showing or hiding dropdown menus in navbar
      // - shows the dropdown menu when it's button is clicked and it is not closed
      // - hides the dropdown menu if it's already open.
      // In addition, automatically close all other dropdown menus in navbar.
      function addDropdownMenuEventListener(button) {

        button.addEventListener('click', event => {
          event.preventDefault();

          const dropdownMenuId = button.id + 'Dropdown';
          const dropdownMenu = document.getElementById(dropdownMenuId);
          const expandMoreIcon = document.querySelector(`#${button.id} .expand-more`);
          const expandLessIcon = document.querySelector(`#${button.id} .expand-less`);
          const showDropdownMenu = !dropdownMenu.classList.contains('show');

          closeAllDropdownMenus();

          if (showDropdownMenu) {
            dropdownMenu.classList.add('show');
            expandLessIcon.classList.add('show');
            expandMoreIcon.classList.remove('show');
          }

        })
      }

      // Clicking a close button in a dropdown menu
      // hides automatically all dropdown menus in navbar.
      function addDropdownCloseButtonEventListener(button) {

        button.addEventListener('click', event => {
          event.preventDefault();

          closeAllDropdownMenus();
        });
      }

      // Clicking outside of navbar in window
      // hides automativally all dropdown menus in navbar
      function addDismissNavbarEventListener() {
        window.addEventListener('click', function (event) {

          const navbar = document.getElementById('navbar');

          if (!navbar.contains(event.target)) {
            closeAllDropdownMenus();
          }
        })

      }

      // Closes all dropdown menus in navbar
      // and updates all the chevron icons
      function closeAllDropdownMenus() {
        const allDropdownMenus = document.querySelectorAll('.navbar-dropdown-menu');
        const allExpandMoreIcons = document.querySelectorAll('.expand-more');
        const allExpandLessIcons = document.querySelectorAll('.expand-less');

        allDropdownMenus.forEach(menu =>
          menu.classList.remove('show')
        );

        allExpandMoreIcons.forEach(icon => {
          icon.classList.add('show');
        })

        allExpandLessIcons.forEach(icon => {
          icon.classList.remove('show');
        })

      }
    }

    // Add the current location as app name
    function addFauxBreadcrumb() {
      const currentUrl = window.location.href;
      const appName = new URL(currentUrl).pathname.split('/').slice(1, 2)[0];
      const appNameDiv = document.getElementById('appName');
      const appNames = ['viewer', 'muuntaja', 'edit', 'artikkelit', ''];
      const appLinkDiv = document.getElementById('appLink');

      if (appNames.includes(appName)) {

        appNameDiv.innerHTML = appName;

        if (appName === '') {
          appNameDiv.innerHTML = 'etusivu';
        }
        
        if (appName === 'edit') {
          appNameDiv.innerHTML = 'muokkaus';
        }
      }

      appLinkDiv.setAttribute('href', '/' + appName);
    }

  }
}

customElements.define('melinda-navbar', Navbar);
