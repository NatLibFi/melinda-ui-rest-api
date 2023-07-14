//*****************************************************************************
//
// Melinda footer custom element for apps
//
//*****************************************************************************

class Footer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        getFooterHtml()
            .then(html => {
                const footer = getFooterElement(html);
                this.appendChild(footer);
                console.log('Footer is added: ', footer.isConnected);
            })
            .catch(error =>
                console.log('Error while setting footer: ', error)
            )



        async function getFooterHtml() {
            const response = await fetch('/../common/templates/footer.html');
            const html = await response.text();
            return html;
        }

        function getFooterElement(html) {
            const parser = new DOMParser();
            const footerDocument = parser.parseFromString(html, 'text/html');
            const footerTemplate = footerDocument.getElementById('footerTemplate');
            const footerFragment = footerTemplate.content.cloneNode(true);
            const footerElement = footerFragment.getElementById('footer');
            return footerElement;
        }

    }
}

customElements.define('melinda-footer', Footer);
