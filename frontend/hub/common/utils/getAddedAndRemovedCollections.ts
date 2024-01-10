import { CollectionVersionSearch } from '../../collections/Collection';
import { collectionKeyFn } from '../api/hub-api-utils';

/**
 * Utility function to get arrays of collections (pulp_hrefs) to be removed and added based on original and
 * updated selection of collections (in a select dialog for example)
 * @param original original list of collections
 * @param current updated list of collections
 * @returns object containing 2 lists: pulp_hrefs of collections to be added and pulp_hrefs of collections to be removed
 */
export function getAddedAndRemovedCollections(
  original: CollectionVersionSearch[],
  current: CollectionVersionSearch[]
) {
  original = original || [];
  current = current || [];
  const added: CollectionVersionSearch[] = [];
  const removed: CollectionVersionSearch[] = [];
  original.forEach((orig) => {
    if (
      !current.find(
        (cur) =>
          collectionKeyFn({
            collection_version: { pulp_href: cur.collection_version?.pulp_href || '' },
            repository: { name: cur.repository?.name || '' },
          }) ===
          collectionKeyFn({
            collection_version: { pulp_href: orig.collection_version?.pulp_href || '' },
            repository: { name: orig.repository?.name || '' },
          })
      )
    ) {
      removed.push(orig);
    }
  });
  current.forEach((cur) => {
    if (
      !original.find(
        (orig) =>
          collectionKeyFn({
            collection_version: { pulp_href: orig.collection_version?.pulp_href || '' },
            repository: { name: orig.repository?.name || '' },
          }) ===
          collectionKeyFn({
            collection_version: { pulp_href: cur.collection_version?.pulp_href || '' },
            repository: { name: cur.repository?.name || '' },
          })
      )
    ) {
      added.push(cur);
    }
  });
  return { added, removed };
}
