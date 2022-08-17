export function setNavBar(elem, name, buttons = {}) {
  const helpButton = buttons.helpButton ? `<button class="material-icons tooltip" tooltip-text="Ohjeet"><a href="${buttons.helpButton.link}" target="_blank" rel="noopener noreferrer">help_outline</a></button>` : '';
  const newButton = buttons.newButton ? `<button class="material-icons tooltip" tooltip-text="Uusi"onClick="onNew(event)">add</button>` : '';
  const searchButton = buttons.searchButton ? `<button class="material-icons tooltip" tooltip-text="Etsi" onClick="onSearch(event)">search</button>` : '';
  const buttonsToAdd = `${helpButton}${newButton}${searchButton}`;

  elem.innerHTML = `<div>
  <div class="NavBar ToolBar">
    <img class="logo" src="/common/images/Melinda-logo-white.png"/>
    <div class="AppName">${name}</div>
    <div class="Spacer"></div>
    <div class="Main-menu-wrap IconBar ToolBar">
      ${buttonsToAdd}
      <div class="dropdown">
        <button id="account-btn" class="material-icons">account_circle</button>
        <div id="account-menu" class="dropdown-content">
          <div class="menu-header" id="username">Tuntematon</div>
          <hr/>
          <div class="menu-item" onClick="onAccount(event)">Kirjaudu ulos</div>
        </div>
      </div>
    </div>
  </div>
  <div id="progressbar" class="progress-bar-inactive"></div>
  </div>`
}

//-----------------------------------------------------------------------------

export function startProcess() {
  const progressbar = document.querySelector(`#progressbar`);
  progressbar.className = "progress-bar";
}

export function stopProcess() {
  const progressbar = document.querySelector(`#progressbar`);
  progressbar.className = "progress-bar-inactive";
}
