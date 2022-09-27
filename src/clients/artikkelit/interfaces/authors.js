import {idbClear, idbAddValueToLastIndex, idbGetStoredValues} from "/artikkelit/indexDB.js"
import {formToJson} from "/common/ui-utils.js";
import {createIconButton, createP} from "/artikkelit/utils.js"

export function initAuthors() {
  console.log('initializing authors...')
  document.getElementById("tekija-lisaa-form").addEventListener("submit", addAuthor);
  document.getElementById("tekija-lisaa-organisaatio").addEventListener("submit", addOrganizationForAuthor);
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
      form.classList.add('full-width');
      const removeButton = createIconButton('close', ['no-border'], `return removeAuthor(event, ${authorData.key})`, 'Poista')
      form.appendChild(removeButton);
      const pRelator = createP(authorData.relator);
      pRelator.classList.add('capitalize');
      form.appendChild(pRelator);
      form.appendChild(createP(authorData.lastName, '&nbsp;-&nbsp;'));
      form.appendChild(createP(authorData.firstName, ',&nbsp;'));
      authorData.authorsTempOrganizations.forEach(organization => {
        form.appendChild(createP(organization.organizationName, '&nbsp;-&nbsp;'));
        if (organization.code) {
          form.appendChild(createP(organization.code, '&nbsp;/&nbsp;'));
        }

        if (organization.organizationShortTerm && !organization.code) {
          form.appendChild(createP(organization.organizationShortTerm, '&nbsp;/&nbsp;'));
        }

        if (organization.note) {
          form.appendChild(createP(organization.note, '&nbsp;(', ')'));
        }
      });
      authorList.appendChild(form)
    })
  });
};

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
      form.classList.add('full-width');
      const removeButton = createIconButton('close', ['no-border'], `return removeOrgForAuthor(event, ${tempOrgData.key})`, 'Poista')
      form.appendChild(removeButton);
      form.appendChild(createP(tempOrgData.organizationName));

      if (tempOrgData.organizationShortTerm) {
        form.appendChild(createP(tempOrgData.organizationShortTerm, '&nbsp;/&nbsp;'));
      }

      if (tempOrgData.code) {
        form.appendChild(createP(tempOrgData.code, '&nbsp;/&nbsp;'));
      }

      if (tempOrgData.note) {
        form.appendChild(createP(tempOrgData.note, '&nbsp;(', ')'));
      }

      organizationList.appendChild(form);
    });
  });
}
