//-----------------------------------------------------------------------------

export function setAppName(name) {
  document.querySelector('#navbar .AppName').innerHTML = name;
}

export function showMainMenu() {
  document.querySelector('#navbar .main-menu').style.display = block;
}

export function addButtonToNavBar(tooltipText, icon, onClickFunction = false, linkAddress = false) {
  const button = document.createElement('button');
  button.classList.add('material-icons');
  button.classList.add('tooltip');

  if (tooltipText) {
    button.setAttribute('tooltip-text', tooltipText)
  }

  if (onClickFunction) {
    button.addEventListener('click', onClickFunction);
  }

  if (linkAddress) {
    const link = document.createElement('a');
    const linkText = document.createTextNode(icon);
    link.appendChild(linkText);
    link.href = linkAddress;
    link.setAttribute('target', '_blank');
    button.append(link);
    return document.querySelector('#navbar .nav-bar-button-wrap').append(button);
  }

  button.innerHTML = icon;
  document.querySelector('#navbar .nav-bar-button-wrap').append(button);
}

export function startProcess() {
  const progressbar = document.querySelector(`#progressbar`);
  progressbar.className = "progress-bar";
}

export function stopProcess() {
  const progressbar = document.querySelector(`#progressbar`);
  progressbar.className = "progress-bar-inactive";
}
