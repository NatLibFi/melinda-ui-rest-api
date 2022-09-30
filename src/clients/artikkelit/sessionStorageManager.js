export function addValueToSessionStoreList(storeName, value = {identifier: undefined}, replace = false) {
  if (value.identifier === undefined) {
    return false;
  }

  const oldItems = window.sessionStorage.getItem(storeName);
  if (oldItems === null) {
    window.sessionStorage.setItem(storeName, JSON.stringify([value]));
    return true;
  }

  const oldItemsArray = JSON.parse(oldItems);
  if(oldItemsArray.some(item => item.identifier === value.identifier)) {
    if (replace) {
      removeValueFromSessionStoreList(storeName, value.identifier);
      window.sessionStorage.setItem(storeName, JSON.stringify([...oldItemsArray, value]));
      return true;
    }

    return false;
  }

  window.sessionStorage.setItem(storeName, JSON.stringify([...oldItemsArray, value]));
  return true;
}

export function removeValueFromSessionStoreList(storeName, identifier) {
  const oldItems = window.sessionStorage.getItem(storeName);
  if (oldItems === null) {
    return true;
  }

  const oldItemsArray = JSON.parse(oldItems);
  const hasValue = oldItemsArray.some(item => item.identifier === `${identifier}`);

  if (hasValue) {
    const newItems = oldItemsArray.filter(item => item.identifier !== `${identifier}`);
    window.sessionStorage.setItem(storeName, JSON.stringify(newItems));
    return true;
  }

  return true;
}

export function resetSessionStoreList(storeName) {
  window.sessionStorage.removeItem(storeName);
}

export function getSessionStoreValue(storeName, identifier) {
  const oldItems = window.sessionStorage.getItem(storeName);
  if (oldItems === null) {
    return false;
  }

  const oldItemsArray = JSON.parse(oldItems);
  return oldItemsArray.find(item => `${item.identifier}` === `${identifier}`);
}

export function getSessionStoreList(storeName) {
  const oldItems = window.sessionStorage.getItem(storeName);
  if (oldItems === null) {
    return [];
  }

  return JSON.parse(oldItems);
}