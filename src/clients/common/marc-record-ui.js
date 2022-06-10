//*****************************************************************************
//
// MARC field editor
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// info needed for muuntaja merge REST call:
// - Base record
// - Transform options
// - Source record
// - Field selections
// - User edits
//-----------------------------------------------------------------------------

export var transformed = {
  options: {},
  source: null,
  base: null,
  exclude: {},
  replace: {},
  insert: null,
}

window.editmode = false;
var editing = null;

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

export function updateTransformed(update) {
  if(update) {
    transformed = update;
  }
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

export function stripFieldDecorations(f) {
  return {
    tag: f.tag,
    ind1: f.ind1,
    ind2: f.ind2,
    value: f.value,
    subfields: f.subfields,
    uuid: f.uuid,
  }
}

//-----------------------------------------------------------------------------
// Exclude/include fields
//-----------------------------------------------------------------------------

function toggleField(event, field) {
  const uuid = field.uuid;

  //console.log("Toggle:", uuid)

  if (!transformed.exclude[uuid]) {
    transformed.exclude[uuid] = stripFieldDecorations(field);
  } else {
    delete transformed.exclude[uuid];
  }

  doTransform();
}

//-----------------------------------------------------------------------------
// Field edit
//-----------------------------------------------------------------------------

export function editField(event, field) {
  // Edit-ohje: https://marc21.kansalliskirjasto.fi/bib/05X-08X.htm#050

  editing = transformed.transformed.record.fields.find(f => f.uuid == field.uuid);
  console.log("Edit:", editing);

  // Find field from edited fields, if found, fill in data from there

  const dlg = document.querySelector("#fieldEditDlg")
  //console.log(dlg)
  dlg.style.display = "flex"

  if (editing) {
    const content = document.querySelector("#fieldEditDlg #field");
    content.innerHTML = ""
    addField(content, editing);
  }

  const tag = document.querySelector("#fieldEditDlg #tag");
  tag.innerHTML = ""
  tag.appendChild(createInput('tag', 'tag', field.tag))

  const ind1 = document.querySelector("#fieldEditDlg #ind1");
  ind1.innerHTML = ""
  ind1.appendChild(createInput('ind1', 'inds', field.ind1))

  const ind2 = document.querySelector("#fieldEditDlg #ind2");
  ind2.innerHTML = ""
  ind2.appendChild(createInput('ind2', 'inds', field.ind2))

  const subfields = document.querySelector("#fieldEditDlg #fieldlist");
  subfields.innerHTML = ""

  for (const subfield of field.subfields) {
    subfields.appendChild(createSubfield(subfields, subfield));
  }

  //*
  Sortable.create(subfields, {
    ghostClass: 'ghost-row',
    animation: 50,
  })
  /**/
}

function createSubfield(parent, subfield) {
  const row = document.createElement("div")
  row.classList.add("subfield")
  row.appendChild(removeButton());
  row.appendChild(createInput('code', 'code', subfield.code));
  row.appendChild(createInput('value', 'value', subfield.value));
  return row;

  function removeButton() {
    const btn = document.createElement('button');
    btn.classList.add("material-icons");
    btn.innerHTML = "close";
    btn.addEventListener("click", event => {
      const state = row.getAttribute("disabled");
      if (state) {
        row.removeAttribute("disabled");
      } else {
        row.setAttribute("disabled", true);
      }
      return true;
    })
    return btn;
  }
}

function createInput(name, className, value, editable = true) {
  const input = document.createElement('span');
  input.setAttribute('id', name);
  input.classList.add(className);
  if (editable) {
    input.classList.add('editable')
  }
  input.innerHTML = value;
  input.contentEditable = editable;
  return input;
}

window.onAddField = function (event) {
  const subfields = document.querySelector("#fieldEditDlg #fieldlist");
  subfields.appendChild(createSubfield(subfields, {code: '?', value: '?'}))
  return eventHandled(event);
}

window.editDlgOK = function (event) {

  const query = (p) => document.querySelector(p);

  const field = {
    uuid: editing.uuid,
    tag: query("#fieldEditDlg #tag #tag").textContent,
    ind1: query("#fieldEditDlg #ind1 #ind1").textContent,
    ind2: query("#fieldEditDlg #ind2 #ind2").textContent,
    subfields: Array.from(query("#fieldEditDlg #fieldlist").childNodes)
      .filter(e => e.classList.contains("subfield"))
      .filter(e => !e.getAttribute("disabled"))
      .map(elem => ({
        code: elem.getElementsByClassName("code")[0].textContent,
        value: elem.getElementsByClassName("value")[0].textContent
      }))
  }

  console.log("Edited:", field)

  if (field.uuid) {
    transformed.replace[field.uuid] = stripFieldDecorations(field);
  } else {
    transformed.insert = field;
  }
  doTransform();

  return editDlgClose(event);
}

window.editDlgUseOriginal = function (event) {
  console.log("Using original.");
  delete transformed.replace[editing.uuid];
  doTransform();
  return editDlgClose(event);
}

window.editDlgClose = function (event) {
  const dlg = document.querySelector("#fieldEditDlg")
  //console.log("Close:", dlg)
  dlg.style.display = "none"
  return eventHandled(event);
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

export function showRecord(data, dest, editmode = false, reference = null) {
  console.log("Show Record:", data);

  const sourceDiv = document.querySelector(`#muuntaja .record-merge-panel #${dest} #Record`);

  // Clear previous content
  sourceDiv.innerHTML = '';

  if (!data) return;

  if (data.error) {
    const error = document.createElement('div');
    error.classList.add("error")
    error.innerHTML = data.error;
    sourceDiv.appendChild(error)
  }

  if (data.notes) {
    const notes = document.createElement('div');
    notes.classList.add("notes")
    notes.innerHTML = data.notes;
    sourceDiv.appendChild(notes)
  }

  if (data.record) {
    const record = data.record;

    if (record.leader) {
      addField(sourceDiv, {tag: 'LDR', value: record.leader}, editmode);
    }

    for (const field of record.fields) {

      function replaced(field) {
        if (!field.uuid) return field;
        return transformed.replace[field.uuid] || field;
      }

      const row = addField(sourceDiv, replaced(field), editmode);

      if (field.uuid) {
        if (editmode) {
          if (field.subfields) row.addEventListener("click", event => editField(event, field))
          /* Add here custom field editors */
        } else {
          row.addEventListener("click", event => toggleField(event, field))
        }
      }
    }
  }
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

function addField(div, field, editmode = false) {
  //console.log(field)
  const row = document.createElement('div');
  row.setAttribute('class', 'row');

  if (transformed.exclude[field.uuid]) {
    row.classList.add("row-excluded");
  } else if (transformed.replace[field.uuid]) {
    row.classList.add("row-replaced");
  } else if (field.from == "source") {
    row.classList.add("row-fromSource")
  } else if (field.from == "base") {
    row.classList.add("row-fromBase")
  }

  addTag(row, field.tag);
  addInd(row, field.ind1, field.ind2);

  if (field.value) {
    addValue(row, field.value);
  } else if (field.subfields) {
    for (const subfield of field.subfields) {
      addSubfield(row, subfield);
    }
  }

  div.appendChild(row);
  return row;

  //---------------------------------------------------------------------------

  function addTag(row, value) {
    row.appendChild(makeSpan('tag', value));
  }

  function addInd(row, ind1, ind2) {
    const span = makeSpan('inds');
    add(span, ind1);
    add(span, ind2);
    row.appendChild(span);

    function add(span, ind) {
      const value = ind && ind.trim() || '&nbsp;';
      span.appendChild(makeSpan('ind', value));
    }
  }

  function text2HTML(value) {
    return value
      .replace("<", "&lt;")
      .replace(">", "&gt;")
      ;
  }

  function addValue(row, value) {
    row.appendChild(makeSpan('value', text2HTML(value)));
  }

  function addSubfield(row, subfield) {
    const span = makeSpan('subfield');
    span.appendChild(makeSubfieldCode(subfield.code));
    span.appendChild(makeSubfieldData(subfield.value));
    row.appendChild(span);
  }

  function makeSubfieldCode(code) {
    return makeSpan('code', `‡${code}`);
  }

  function makeSubfieldData(value) {
    return makeSpan('value', value);
  }
}

function makeDiv(className, value) {
  const div = document.createElement('div');
  div.setAttribute('class', className);
  if (value) {
    div.innerHTML = value;
  }
  return div;
}

function makeSpan(className, value) {
  const span = document.createElement('span');
  span.setAttribute('class', className);
  if (value) {
    span.innerHTML = value;
  }
  return span;
}
