export function sanitaze(value) {
  return value
    .replace(/\r/gu, '')
    .replace(/%0d/gu, '')
    .replace(/%0D/gu, '')
    .replace(/\n/gu, '')
    .replace(/%0a/gu, '')
    .replace(/%0A/gu, '');
}
