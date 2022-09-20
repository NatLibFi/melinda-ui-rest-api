// usage: const uniqValues = [...].filter(onlyUnique);
export function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
