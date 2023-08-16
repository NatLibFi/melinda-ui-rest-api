
export function generatef100sf110sf700sf710s(authors = []) {

  if (!authors || authors.length === 0) {
    return [];
  }

  const authorFields = authors.map((author, index) => {

    if (index === 0) {
      if (['toimittaja', 'kuvittaja', 'kääntäjä'].includes(author.relator)) {
        return generate700or710();
      }
      return generate100or110();
    }

    return generate700or710();

    function generate100or110() {
      if (authors[0].firstName === ' ' && authors[0].lastName === ' ') {          
        return []; // hit space key on both means: 'skip this'
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

      if (firstChar === 'c' && firstNameSplitted.length > 1) { // title case
        return '0';
      }

      if (author.firstName === ' ') { // one name case
        return '0';
      }

      const ind1chkd = author.relator === 'yhteisö' ? '2' : '1';
      return ind1chkd;
    }

    function generateSubfieldsForPerson() { // 100 & 700
      const subA = {code: 'a', value: `${author.lastName}, ${author.firstName},`};
      const subAshort = {code: 'a', value: `${author.lastName},`}; // used only with C-subfield (title case)
      const theTitle = `${author.firstName.slice(2)},`;
      const subC = {code: 'c', value: theTitle};
      const subE = {code: 'e', value: `${author.relator}.`};
      const mapOrgnNames = author.authorsTempOrganizations.map(elem => `${elem.organizationName}`);

      function checkIfOnlyOneNameCase() {
        // checking: is it title-case ( = c+title) or onlyOneName-case ( = empty entered as first name)
        // 'etunimi'-field in both cases is essential. First entered character there is crucial.
        const firstNameSplitted = author.firstName.split(' ');
        const [firstChar] = firstNameSplitted;

        if (author.firstName === ' ') { // case: only one name entered
          return 'oneNameCase';
        }

        if (firstChar === 'c' && firstNameSplitted.length > 1) { // case: title entered
          return 'titleCase';
        }

        return false;
      }

      function checkRole() {
        if (['kirjoittaja', 'kuvittaja', 'kääntäjä', 'toimittaja'].includes(author.relator)) {
          return true;
        }

        return false;
      }

      if (mapOrgnNames.length > 0) {
        const subU = generateOrganizations();
        const subG = generateOrgnCodes();

        if (checkIfOnlyOneNameCase() === 'titleCase') {
          return [subAshort, subC, subE, subU, subG];
        }

        if (checkIfOnlyOneNameCase() === 'oneNameCase' && checkRole()) {
          return [subAshort, subE, subU, subG];
        }

        if (checkIfOnlyOneNameCase()) {
          return [subAshort, subC, subE, subU, subG];
        }

        return [subA, subE, subU, subG];
      }
      

      if (checkIfOnlyOneNameCase() === 'titleCase') {
        return [subAshort, subC, subE];
      }

      if (checkIfOnlyOneNameCase() === 'oneNameCase' && checkRole()) {
        return [subAshort, subE];
      }

      if (checkIfOnlyOneNameCase()) {
        return [subAshort, subC, subE];
      }

      return [subA, subE];

    }

    function generateSubfieldsForYhteiso() { // 110 & 710
      // Here subA ends in dot (.) & uses only lastName; subE NOT used in 110,710
      const subA = {code: 'a', value: `${author.corporateName}.`};
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
