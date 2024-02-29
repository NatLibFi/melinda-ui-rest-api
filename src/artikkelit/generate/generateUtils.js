// usage: const uniqValues = [...].filter(onlyUnique);
export function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

// For example field 245 => the title of article
export function addDotIfNeeded(checkThis) {
  const string = checkThis.trim();
  const stringLength = string.length;
  const lastChar = string.charAt(stringLength - 1);

  if (lastChar === '.' || lastChar === '?' || lastChar === '!') {
    return '';
  }

  return '.';
}
