//*************************************************************************
//
// REST API Test Client
//
//*************************************************************************

function initialize() {
  document.getElementById('melindaId').addEventListener('keydown', onKeyDown);
}

function onKeyDown(event) {
  //console.log('keydown', event);
  if (event.key === 'Enter') {
    event.preventDefault();
    const id = event.target.value;
    loadRecord(id);
  }
}

//-------------------------------------------------------------------------

function loadRecord(melindaId) {
  console.log('Load:', melindaId);
  // DEMO
  const demoRecord = {
    leader: 'demo',
    fields: [
      {
        tag: '100',
        ind1: ' ',
        ind2: ' ',
        subfields: [{code: 'a', value: 'demo'}]
      }
    ]
  };
  //insertRecord(demoRecord.fields[0]);

  // Rest fetch
  const uri = `http://localhost:8081/bib/${melindaId}`;

  const h = new Headers();
  h.append('Accepts', 'application/json');

  const req = new Request(uri, {
    method: 'GET',
    mode: 'no-cors',
    headers: h,
    credentials: 'same-origin'
  });

  fetch(req)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      insertRecord(data);
    });
}

//-------------------------------------------------------------------------

function insertRecord(data) {
  const container = document.getElementById('sourceRecord');
  const row = document.createElement('div');
  row.setAttribute('class', 'row');

  const f100 = findField(data, '100');
  const author = f100[0].subfields[0].value;

  const f245 = findField(data, '245');
  const title = f245[0].subfields[0].value;

  row.append(
    makeP('tag', author),
    makeP('tag', title)

    /*
    makeP(data.tag, 'tag'),
    makeP(data.ind1 || ' ', 'ind1'),
    makeP(data.ind2 || ' ', 'ind2'),
    makeP("‡" + data.subfields[0].code || ' ', 'code'),
    makeP(data.subfields[0].value || ' ', 'value'),
    */
  );
  container.appendChild(row);

  function findField(data, fieldId) {
    return data.fields.filter(f => f.tag == fieldId); // eslint-disable-line eqeqeq
  }

  function makeP(className, value) {
    const p = document.createElement('p');
    p.innerHTML = value; // eslint-disable-line functional/immutable-data
    p.setAttribute('class', className);
    return p;
  }
}

//-------------------------------------------------------------------------

function clearRecords() {
  console.log('Clearing');
  const container = document.getElementById('sourceRecord');
  container.innerHTML = ''; // eslint-disable-line functional/immutable-data
}
