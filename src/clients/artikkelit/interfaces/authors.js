import {idbClear, idbAddValueToLastIndex, idbGetStoredValues} from "/artikkelit/indexDB.js"
import {formToJson, createIconButton, createP} from "/common/ui-utils.js";

export function initAuthors() {
  console.log('initializing authors...');
  document.getElementById("tekija-lisaa-form").addEventListener("submit", addAuthor);
  document.getElementById("tekija-lisaa-organisaatio").addEventListener("submit", addOrganizationForAuthor);

  document.getElementById("tyhjenna-tekijat-form").addEventListener("submit", clearAuthors);

  refreshAuthorsList();
  refreshAuthorOrganizationList();
}

export function addAuthor(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  idbGetStoredValues('artoAuthorTempOrg').then(authorsTempOrganizations => {
    console.log(authorsTempOrganizations);

    const data = {
      firstName: formJson['tekija-etunimi'],
      lastName: formJson['tekija-sukunimi'],
      relator: formJson['tekija-rooli'],
      authorsTempOrganizations
    }

    idbAddValueToLastIndex('artoAuthors', data).then(() => {
      refreshAuthorsList();
    });
  });
}

export function resetAuthor(event) {
  event.preventDefault();
  idbClear('artoAuthorTempOrg').then(() => {
    const organizationList = document.getElementById('tekija-organisaatiot-list');
    organizationList.innerHTML = '';
    document.getElementById('tekija-etunimi').value = '';
    document.getElementById('tekija-sukunimi').value = '';
    document.getElementById('tekija-rooli').value = 'kirjoittaja';
    document.getElementById('tekija-organisaatio').value = '';
  });
}

export function refreshAuthorsList() {
  const authorList = document.getElementById('tekija-list');
  authorList.innerHTML = '';

  idbGetStoredValues('artoAuthors').then(authors => {
    authors.forEach(authorData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('close', ['no-border', 'negative'], `return removeAuthor(event, ${authorData.key})`, 'Poista')
      div.appendChild(createP('Tekijä', '', '&nbsp;-&nbsp;', ['label-text']));
      const pRelator = createP(authorData.relator);
      pRelator.classList.add('capitalize');
      div.appendChild(pRelator);
      div.appendChild(createP(authorData.lastName, '&nbsp;-&nbsp;'));
      div.appendChild(createP(authorData.firstName, ',&nbsp;'));
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
      authorList.appendChild(form)
    });

    if (authors.length > 1) {
      document.getElementById("tyhjenna-tekijat-form").style.display = 'block';
    }

    if (authors.length < 2) {
      document.getElementById("tyhjenna-tekijat-form").style.display = 'none';
    }
  });
};

export function clearAuthors(event) {
  event.preventDefault();
  idbClear('artoAuthors').then(() => refreshAuthorsList());
}

// artoAuthorTempOrg
export function addOrganizationForAuthor(event) {
  event.preventDefault();
  const formJson = formToJson(event);
  const organizationInputValue = formJson['tekija-organisaatio']
  const [organizationNameAndShortTerm = false, code = false, note = false] = organizationInputValue.split(' - ');
  const [organizationName, organizationShortTerm] = organizationNameAndShortTerm.split(' (').map(value => value.replace(')', ''));

  idbAddValueToLastIndex('artoAuthorTempOrg', {organizationName, code, organizationShortTerm, note}).then(() => {
    document.getElementById('tekija-organisaatio').value = '';
    refreshAuthorOrganizationList()
  });
};

export function refreshAuthorOrganizationList() {
  const organizationList = document.getElementById('tekija-organisaatiot-list');
  organizationList.innerHTML = '';

  idbGetStoredValues('artoAuthorTempOrg').then(tempOrgs => {
    tempOrgs.forEach(tempOrgData => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      div.classList.add('full-width');
      const removeButton = createIconButton('close', ['no-border', 'negative'], `return removeOrgForAuthor(event, ${tempOrgData.key})`, 'Poista')
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