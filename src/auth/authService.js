/**
 * Used to sanitize strings like username, email or similar
 * @param {object} param0
 * @param {string} param0.value value to be mutated
 * @param {object} param0.options options object
 * @param {string} param0.options.allowedPattern allowed pattern for characters
 * @param {boolean} [param0.options.useLengthCheck=true] should length be tested
 * @param {boolean} [param0.options.min=1] min legth
 * @param {boolean} [param0.options.max=12] max legth
 *
 * @returns {string}
 */
export function sanitizeString(param0) {
  const {value, options = {allowedPattern: undefined, useLengthCheck: true, min: 1, max: 12}} = param0;
  if (!options || !options?.allowedPattern) {
    return value;
  }

  const cleanValue = value.replace(new RegExp(`[^${options.allowedPattern}]`, 'gu'), '');

  if (options.useLengthCheck && (cleanValue.length < options.min || cleanValue.length > options.max)) {
    throw new Error(`Value given to sanitaze must be between ${options.min} and ${options.max} characaters`);
  }

  return cleanValue;
}
