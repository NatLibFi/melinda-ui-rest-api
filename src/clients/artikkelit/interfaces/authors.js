import {checkArticleForm} from '/artikkelit/actions/articleCheck.js';
import {idbAddValueToLastIndex, idbClear, idbDel, idbGetStoredValues} from '/artikkelit/utils/indexedDB.js';
import {createIconButton, createP, formToJson, showSnackbar} from '/common/ui-utils.js';


export function initAuthors() {
  //console.log('initializing authors...');

  document.getElementById('tekija-lisaa-form').addEventListener('submit', addAuthor);
  document.getElementById('tekija-lisaa-organisaatio').addEventListener('submit', addOrganizationForAuthor);
  document.getElementById('tyhjenna-tekijat-form').addEventListener('submit', clearAuthors);

  refreshAuthorsList();
  refreshAuthorOrganizationList();
}

export function refreshAuthorsList() {
  const authorList = document.getElementById('tekija-list');
  authorList.innerHTML = '';

  idbGetStoredValues('artoAuthors').then(authors => {
    authors.forEach(authorData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('delete_outline', ['alternate-red', 'small'], `return removeAuthor(event, ${authorData.key})`, 'Poista');
      div.appendChild(createP('Tekijä', '', '&nbsp;-&nbsp;', ['label-text']));
      const pRelator = createP(authorData.relator);
      pRelator.classList.add('capitalize');

      div.appendChild(pRelator);

      if (['kirjoittaja', 'kuvittaja', 'kääntäjä', 'toimittaja'].includes(authorData.relator)) {
        div.appendChild(createP(authorData.lastName, '&nbsp;-&nbsp;'));

        if (authorData.firstName !== '') {
          div.appendChild(createP(authorData.firstName, ',&nbsp;'));
        }
      }

      if (authorData.relator === 'yhteisö') {
        div.appendChild(createP(authorData.corporateName, '&nbsp;-&nbsp;'));
      }

      authorData.authorsTempOrganizations.forEach(organization => {
        div.appendChild(createP(organization.organizationName, '&nbsp;-&nbsp;'));
        if (organization.code) {
          div.appendChild(createP(organization.code, '&nbsp;/&nbsp;'));
        }

        if (organization.organizationShortTerm && !organization.code) {
          div.appendChild(createP(organization.organizationShortTerm, '&nbsp;/&nbsp;'));
        }

        if (organization.note) {
          div.appendChild(createP(organization.note, '&nbsp;(', ')'));
        }
      });
      div.appendChild(removeButton);
      form.appendChild(div);
      authorList.appendChild(form);
    });

    if (authors.length > 1) {
      document.getElementById('tyhjenna-tekijat-form').style.display = 'block';
    }

    if (authors.length < 2) {
      document.getElementById('tyhjenna-tekijat-form').style.display = 'none';
    }
  });

  doUpdate();
}

export function refreshAuthorOrganizationList() {
  const organizationList = document.getElementById('tekija-organisaatiot-list');
  organizationList.innerHTML = '';

  idbGetStoredValues('artoAuthorTempOrg').then(tempOrgs => {
    tempOrgs.forEach(tempOrgData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('delete_outline', ['alternate-red', 'small'], `return removeOrgForAuthor(event, ${tempOrgData.key})`, 'Poista');
      div.appendChild(createP('Organisaatio', '', '&nbsp;-&nbsp;', ['label-text']));
      div.appendChild(createP(tempOrgData.organizationName));

      if (tempOrgData.organizationShortTerm) {
        div.appendChild(createP(tempOrgData.organizationShortTerm, '&nbsp;/&nbsp;'));
      }

      if (tempOrgData.code) {
        div.appendChild(createP(tempOrgData.code, '&nbsp;/&nbsp;'));
      }

      if (tempOrgData.note) {
        div.appendChild(createP(tempOrgData.note, '&nbsp;(', ')'));
      }
      div.appendChild(removeButton);
      form.appendChild(div);
      organizationList.appendChild(form);
    });
  });
}

window.articleAuthorRoleChange = (event) => {
  const authorFirstName = document.getElementById('input-tekija-etunimi');
  const authorLastName = document.getElementById('input-tekija-sukunimi');
  const authorCorporateName = document.getElementById('input-tekija-yhteison-nimi');

  const selectedRole = event.target.value;

  authorFirstName.style.display = 'flex';
  authorLastName.style.display = 'flex';
  authorCorporateName.style.display = 'none';


  if (selectedRole === 'yhteisö') {
    authorFirstName.style.display = 'none';
    authorLastName.style.display = 'none';
    authorCorporateName.style.display = 'flex';
  }
}

window.resetAuthor = (event) => {
  event.preventDefault();
  idbClear('artoAuthorTempOrg').then(() => {
    const organizationList = document.getElementById('tekija-organisaatiot-list');
    const authorRoleSelect = document.getElementById('tekija-rooli');
    organizationList.innerHTML = '';
    document.getElementById('tekija-etunimi').value = '';
    document.getElementById('tekija-sukunimi').value = '';
    document.getElementById('tekija-yhteison-nimi').value = '';
    document.getElementById('tekija-organisaatio').value = '';
    document.getElementById('tekija-rooli').value = 'kirjoittaja';
    checkArticleForm();
    return authorRoleSelect.dispatchEvent(new Event('change'));
  });
};

window.removeAuthor = (event, key) => {
  event.preventDefault();
  idbDel('artoAuthors', key).then(() => refreshAuthorsList());
};

window.removeOrgForAuthor = (event, key) => {
  event.preventDefault();
  idbDel('artoAuthorTempOrg', key).then(() => refreshAuthorOrganizationList());
};

function addAuthor(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  idbGetStoredValues('artoAuthorTempOrg').then(authorsTempOrganizations => {

    const data = {
      firstName: formJson['tekija-etunimi'],
      lastName: formJson['tekija-sukunimi'],
      corporateName: formJson['tekija-yhteison-nimi'],
      relator: formJson['tekija-rooli'],
      authorsTempOrganizations
    };

    if (['kirjoittaja', 'kuvittaja', 'kääntäjä', 'toimittaja'].includes(data.relator) && data.lastName === '') {
      showSnackbar({text: 'Tekijän sukunimi ei voi olla tyhjä', closeButton: 'true'});
      return;
    }

    if (data.relator === 'yhteisö' && data.corporateName === '') {
      showSnackbar({text: 'Yhteisön nimi ei voi olla tyhjä', closeButton: 'true'});
      return;
    }

    if (data.lastName === ' ' || data.firstName === ' ' || data.corporateName === ' ') {
      showSnackbar({text: 'Tarkista kentät: tekijän nimi ei voi olla välilyönti', closeButton: 'true'});
      return;
    }

    idbAddValueToLastIndex('artoAuthors', data).then(() => {
      resetAuthor(event);
      refreshAuthorsList();
    });
  });
}


function addOrganizationForAuthor(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  const organizationInputValue = formJson['tekija-organisaatio'];

  if (organizationInputValue === '') {
    showSnackbar({style: 'alert', text: 'Organisaatio ei voi olla tyhjä'});
    return;
  }

  // See if this can be simplified or optimized (e.g. by utilizing event.target etc)
  const {code} = document.querySelector(`#tekija-organisaatio-lista [value="${organizationInputValue}"]`).dataset;

  const [organizationName = false, note = false] = organizationInputValue.replace(' (uusi)', '').replace(' (vanha)', '').split(' - ');

  idbGetStoredValues('artoAuthorTempOrg').then(organizations => {
    if (organizations.some(org => org.organizationName === organizationName || org.code === code)) {
      showSnackbar({style: 'alert', text: 'Tekijälle on jo lisätty tämä organisaatio'});
      return;
    }

    idbAddValueToLastIndex('artoAuthorTempOrg', {organizationName, code, note}).then(() => {
      document.getElementById('tekija-organisaatio').value = '';
      refreshAuthorOrganizationList();
    });
  });
}

function clearAuthors(event) {
  event.preventDefault();
  idbClear('artoAuthors').then(() => refreshAuthorsList());
}
