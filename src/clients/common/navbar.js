
export function setNavBar(elem, name) {
  const navBar = createItem('div', ['NavBar', 'ToolBar']);
  elem.appendChild(navBar);
  navBar.appendChild(createImageItem());

  const appName = createItem('div', ['AppName']);

  const btn = createButtonItem(name);
  navBar.appendChild(appName);
  appName.appendChild(btn);
  btn.appendChild(createDropdownMenu(name));

  elem.appendChild(createItem('div', ['progress-bar-inactive'], 'progressbar'));

  function createItem(elemTag, clsList = [], id = '') {
    const item = document.createElement(elemTag);
    if (clsList.length > 0) {
      item.classList.add(...clsList);
    }
    if (id.length > 0) {
      item.id = id;
    }
    return item;
  }

  function createImageItem() {
    const img = createItem('img', ['logo']);
    img.src = '/common/images/Melinda-logo-white.png';
    return img;
  }

  function createButtonItem(name) {
    const btn = createItem('button', ['dropdown-btn']);
    btn.addEventListener('click', () => {
      togglePages();
    });
    btn.innerHTML = `${name}<span class="material-icons">arrow_drop_down</span>`;
    return btn;
  }

  function createDropdownMenu(name) {
    const pageData = ['Artikkelit', 'Keycloak', 'Muokkaus', 'Muuntaja', 'Viewer'];
    const dropdownMenu = createItem('ul', ['page-dropdown-content'], 'pageDropdown');
    for (const page of pageData) {
      if (page.toLowerCase() !== name.toLowerCase()) {
        const listElem = createItem('li');
        const linkElem = createItem('a');
        linkElem.href = page === 'Muokkaus' ? '/edit' : `/${page.toLowerCase()}`;
        const linkTextElem = createItem('div', ['menu-item']);
        linkTextElem.innerHTML = page;
        linkElem.appendChild(linkTextElem);
        listElem.appendChild(linkElem);
        dropdownMenu.appendChild(listElem);
      }
    }

    return dropdownMenu;
  }

  function togglePages() {
    document.querySelector('#pageDropdown').classList.toggle('show-pages');
  }

  // Hide page list if the user clicks outsife of it while open
  window.onclick = function(e) {
    if (!e.target.matches('.dropdown-btn') && !e.target.matches('.material-icons')) {
      const dropdown = document.querySelector('#pageDropdown');
      if (dropdown.classList.contains('show-pages')) {
        dropdown.classList.remove('show-pages');
      }
    }
  };
}

//-----------------------------------------------------------------------------

export function startProcess() {
  const progressbar = document.querySelector(`#progressbar`);
  progressbar.className = 'progress-bar';
}

export function stopProcess() {
  const progressbar = document.querySelector(`#progressbar`);
  progressbar.className = 'progress-bar-inactive';
}
