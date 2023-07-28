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

  }
}

customElements.define('melinda-navbar', Navbar);
