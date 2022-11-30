
export function generatef100sf110sf700sf710s(authors = []) {
  if (authors.length === 0) {
    return [];
  }

  const authorFields = authors.map((author, index) => {
    if (index === 0) {
      return generate100or110();
    }

    return generate700or710();

    function generate100or110() {
      if (authors[0].firstName === ' ' && authors[0].lastName === ' ') {
        return []; // hit space key on both means: skip this
      }

      return {
        tag: author.relator === 'yhteisö' ? '110' : '100',
        ind1: ind1Value(),
        ind2: ' ',
        subfields: author.relator === 'yhteisö' ? generateSubfieldsForYhteiso() : generateSubfieldsForPerson()
      };

    }

    function generate700or710() {
      return {
        tag: author.relator === 'yhteisö' ? '710' : '700',
        ind1: ind1Value(),
        ind2: ' ',
        subfields: author.relator === 'yhteisö' ? generateSubfieldsForYhteiso() : generateSubfieldsForPerson()
      };
    }

    function ind1Value() {
      const firstNameSplitted = author.firstName.split(' ');
      const [firstChar] = firstNameSplitted;

      if (firstChar === 'c' && firstNameSplitted.length > 1) {
        return '0';
      }

      const ind1chkd = author.relator === 'yhteisö' ? '2' : '1';
      return ind1chkd;
    }

    function generateSubfieldsForPerson() { // 100 & 700
      const subA = {code: 'a', value: `${author.lastName}, ${author.firstName},`};
      const subAC = {code: 'a', value: `${author.lastName},`}; // used only with C-subfield (title case)
      const subE = {code: 'e', value: `${author.relator}.`};
      const mapOrgnNames = author.authorsTempOrganizations.map(elem => `${elem.organizationName}`);

      function doSubC() { // title case, when in field firstname is: c+title
        const firstNameSplitted = author.firstName.split(' ');
        const [firstChar] = firstNameSplitted;

        if (firstChar === 'c' && firstNameSplitted.length > 1) {
          const theTitle = `${author.firstName.slice(2)},`;
          const outputC = {code: 'c', value: theTitle};
          return outputC;
        }

        return false;
      }

      if (mapOrgnNames.length > 0) {
        const subU = generateOrganizations();
        const subG = generateOrgnCodes();

        if (doSubC()) {
          return [subAC, doSubC(), subE, subU, subG];
        }

        return [subA, subE, subU, subG];
      }

      if (doSubC()) {
        return [subAC, doSubC(), subE];
      }

      return [subA, subE];
    }

    function generateSubfieldsForYhteiso() { // 110 & 710
      // Here subA ends in dot (.) & uses only lastName; subE NOT used in 110,710
      const subA = {code: 'a', value: `${author.lastName}.`};
      const mapOrgnNames = author.authorsTempOrganizations.map(elem => `${elem.organizationName}`);

      if (mapOrgnNames.length > 0) {
        const subU = generateOrganizations();
        const subG = generateOrgnCodes();
        return [subA, subU, subG];
      }

      return [subA];
    }

    function generateOrganizations() {
      const mapOrgnNames = author.authorsTempOrganizations.map(elem => `${elem.organizationName}`);
      const editOrgnNames = mapOrgnNames.toString().replaceAll(',', ' ; ');
      return {code: 'u', value: `${editOrgnNames}`};
    }


    function generateOrgnCodes() {
      const code = author.authorsTempOrganizations.map(elem => `${elem.code}`);
      const editCodes = code.toString().replaceAll(',', ' ');
      return {code: 'g', value: `(orgn)${editCodes}`};
    }

  });

  return authorFields;
}
