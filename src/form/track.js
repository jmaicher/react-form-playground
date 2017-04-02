import findIndex from 'lodash.findindex';

import * as s from './state';

/**
 * Used to track models in a collection, similar to key in React.
 *
 * Usage: track('path.to.collection[]', { id: 5 })
 *
 * Limitations:
 * - only supports arrays
 * - does not yet support nested collections, e.g. path.collection1[].collection2[]
 *
 * @param {String} path
 * @param {*} predicate
 */
export const track = (path, predicate) => (state) => {
  const [collectionPath, itemSubPath] = path.split(/\[\]\.?/);

  const collection = s.getFieldValue(state, collectionPath, []);
  if(!Array.isArray(collection)) {
    throw new Error(`Unsupported collection type '${typeof collection}' for track`);
  }

  const idx = findIndex(collection, predicate);

  if (idx < 0) {
    console.error('Tracked item not found at', path, 'with predicate', predicate);
    throw new Error(`Tracked item not found: ${path}`);
  }

  let itemPath = `${collectionPath}[${idx}]`;
  if (itemSubPath) {
    itemPath += `.${itemSubPath}`;
  }

  return itemPath;
}

export default track;
