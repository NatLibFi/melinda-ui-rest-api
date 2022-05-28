//*****************************************************************************
//
// Utilities for UI
//
//*****************************************************************************

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

//-----------------------------------------------------------------------------

export function showTab(...tabs) {
  const root = document.getElementById('root');
  for (const child of root.children) {
    if (tabs.includes(child.getAttribute('id'))) {
      child.hidden = false;
      child.style.display = null;
    } else {
      child.hidden = true;
      child.style.display = 'none';
    }
  }
}

export function resetForms(...elems) {
  for (const elem of elems) {
    const forms = elem.querySelectorAll('form');
    for (const form of forms) {
      form.reset();
    }
  }
}

export function reload() {
  // Programmatically reload page and reset forms
  location.reload();
}

//-----------------------------------------------------------------------------

export function createMenuItem(name, className) {
  const item = document.createElement("div");
  item.classList.add(className);
  item.innerHTML = name;
  return item;
}

export function createMenuSelection(group, value, desc, className) {
  const id = `${group}-${value}`;
  const item = createMenuItem("", className);
  const radiobtn = document.createElement("input")
  radiobtn.setAttribute("type", "radio");
  radiobtn.setAttribute("id", id);
  radiobtn.setAttribute("name", group);
  radiobtn.setAttribute("value", value);
  radiobtn.setAttribute("value", value);

  const label = document.createElement("label");
  label.setAttribute("for", id);
  label.innerHTML = desc;

  item.appendChild(radiobtn);
  item.appendChild(label);
  return item;
}

export function createMenuBreak() {
  const item = document.createElement("hr");
  return item;
}