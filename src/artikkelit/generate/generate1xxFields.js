
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
      return {
        tag: author.relator === 'yhteisö' ? '110' : '100',
        ind1: '1',
        ind2: ' ',
        subfields: generateSubfields()
      };
    }

    function generate700or710() {
      return {
        tag: author.relator === 'yhteisö' ? '710' : '700',
        ind1: '1',
        ind2: ' ',
        subfields: generateSubfields()
      };
    }

    function generateSubfields() {
      const subA = {code: 'a', value: `${author.lastName}, ${author.firstName}.`};
      const subE = {code: 'e', value: author.relator};
      const subU = generateOrganizations();
      const subG = generateOrgnCodes();
      return [subA, subE, subU, subG];
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
