
export function setNavBar(elem, name) {
  const topDiv = document.createElement("div");
  const navBar = document.createElement("div");
  elem.appendChild(navBar);
  navBar.classList.add("NavBar", "ToolBar");

  const img = document.createElement("img");
  img.className = "logo";
  img.src = "/common/images/Melinda-logo-white.png";
  navBar.appendChild(img);
  
  const appName = document.createElement("div");
  appName.className = "AppName";
  const btn = document.createElement("button");
  btn.className = "dropdown";
  btn.addEventListener("click", () => {togglePages()});
  btn.innerHTML = `${name}<span class="material-icons">arrow_drop_down</span>`;
  appName.appendChild(btn);
  navBar.appendChild(appName);

  const dropdownMenu = document.createElement("ul");
  dropdownMenu.className = "page-dropdown-content";
  dropdownMenu.id = "pageDropdown";
  const artikkelit = document.createElement("li");
  // artikkelit.className = "menu-item";
  const artikkelitLink = document.createElement("a");
  artikkelitLink.href = "/artikkelit";
  // artikkelitLink.className = "menu-item";
  const artikkelitText = document.createElement("div");
  artikkelitText.className = "menu-item";
  artikkelitText.innerHTML = "Artikkelit";
  artikkelitLink.appendChild(artikkelitText);
  artikkelit.appendChild(artikkelitLink);
  // artikkelit.href = "/artikkelit";
  // artikkelit.innerHTML = "Artikkelit";
  dropdownMenu.appendChild(artikkelit);
  btn.appendChild(dropdownMenu);


  const progressBar = document.createElement("div");
  progressBar.id = "progressbar";
  progressBar.className = "progress-bar-inactive";
  elem.appendChild(progressBar);
  // elem.innerHTML = `<div>\
  // <div class="NavBar ToolBar">\
  //   <img class="logo" src="/common/images/Melinda-logo-white.png"/>\
  //   <div class="AppName">\
  //     <button onclick="showPages()">${name}<span class="material-icons">arrow_drop_down</span></button>\
  //   </div>\
  //   <div class="dropdown-content" id="pageDropdown">\
  //     <a href="/artikkelit">Artikkelit</a>\
  //   </div>\
  //   <div class="Select VBox">\
  //     <label for="page">Vaihda sivua</label>
  //     <select id="page" onChange="window.location.href=this.value">\
  //       <option value="" selected hidden disabled>--</option>\
  //       <option value="/artikkelit">Artikkelit</option>\
  //       <option value="/edit">Muokkaus</option>\
  //       <option value="/keycloak">Keycloak</option>\
  //       <option value="/muuntaja">Muuntaja</option>\
  //       <option value="/viewer">Viewer</option>\
  //     </select>\
  //   </div>\
  // </div>\
  // <div id="progressbar" class="progress-bar-inactive"></div>\
  // </div>`
  function togglePages() {
    document.querySelector("#pageDropdown").classList.toggle("show-pages");
  }
}

//-----------------------------------------------------------------------------

export function startProcess()
{
  const progressbar = document.querySelector(`#progressbar`);
  progressbar.className="progress-bar";
}

export function stopProcess()
{
  const progressbar = document.querySelector(`#progressbar`);
  progressbar.className="progress-bar-inactive";
}
