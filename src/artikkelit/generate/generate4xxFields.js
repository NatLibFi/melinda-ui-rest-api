
// https://www.kiwi.fi/pages/viewpage.action?pageId=155648846 -> toistuva palsta
export function generatef490(sectionOrColumn = false) {
  if (sectionOrColumn) {
    return [{tag: '490', ind1: '0', ind2: ' ', subfields: [{code: 'a', value: sectionOrColumn}]}];
  }

  return [];
}
