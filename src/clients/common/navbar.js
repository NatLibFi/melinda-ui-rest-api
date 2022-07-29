
export function setNavBar(elem, name) {
  elem.innerHTML = `<div>\
  <div class="NavBar ToolBar">\
    <img class="logo" src="/common/images/Melinda-logo-white.png"/>\
    <div class="AppName">${name}</div>\
    </div>\
  <div id="progressbar" class="progress-bar-inactive"></div>\
  </div>`
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
