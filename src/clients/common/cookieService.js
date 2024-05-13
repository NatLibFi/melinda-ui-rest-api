//*****************************************************************************
//
// Helper for managing cookies on client side
//
//*****************************************************************************

/**
 * Mainly cookies should be set and set to be removed from route
 * Read and removal here
 */

/**
 * Set cookie names to array so other people can know what to expect and clear local ones can use it to clear those
 * Only set cookie names that are available to change on client side (option httpOnly: false)
 */
const knownCookieNamesForClient = [
];

/**
 * Get value from cookies available to client
 *
 * @param {String} name - name of the cookie available for client side code
 * @param {boolean} [parseValue=false] - if the value is stringified object use this to parse the value before return, defaults to false
 * @returns {*|undefined} value or undefined
 */
export function getCookie(name, parseValue = false) {
    const value = getRawCookieValue(name);
    if(!value){
        console.log('No requested cookie found');
        return undefined;
    }
    return decodeURIComponent(value);
}
function getRawCookieValue(name){
    const cookieRow = document.cookie
    .split('; ')
    .find(row => row.startsWith(name));

    if(cookieRow)
        return cookieRow.split('=')[1];

    return undefined;
}

/**
 * Clear named cookies from client
 */
export function clearPredefinedCookies() {
    for (const cookieName of knownCookieNamesForClient) {
        clearCookie(cookieName);
    }
}

/**
 * Clear named cookies from client
 * @param {string[]} arrayOfItems 
 */
export function clearCookies(arrayOfItems) {
    for (const cookieName of arrayOfItems) {
        clearCookie(cookieName);
    }
}

/**
 * Clear a cookie by setting its expiration date to a past date
 *
 * @param {String} name - name of the cookie set to be invalidated
 */
export function clearCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure;";
}