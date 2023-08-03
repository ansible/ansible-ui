import { HubItemsResponse } from '../../useHubView';
import { hubAPI } from '../../api';
import { CollectionVersionSearch } from '../../collections/CollectionVersionSearch';
import { CategorizedCollections, CollectionCategory } from '../CollectionCategory';
import { requestGet } from '../../../common/crud/Data';
import { SetStateAction, useCallback, useEffect } from 'react';
import { errorToAlertProps, usePageAlertToaster } from '../../../../framework';

export function useCategorizeCollections(
  managedCategories: CollectionCategory[],
  setCategorizedCollections: (value: SetStateAction<CategorizedCollections>) => void
) {
  const alertToaster = usePageAlertToaster();

  const fetchCollectionsForEachCategory = useCallback(async () => {
    const collectionsInCategories: CategorizedCollections = {};
    // Maximum of 12 collections displayed per category ordered by time of creation (newest collections appearing first)
    const searchAPIPromises = managedCategories.map((collectionCategory: CollectionCategory) =>
      requestGet<HubItemsResponse<CollectionVersionSearch>>(
        hubAPI`/v3/plugin/ansible/search/collection-versions/?limit=12&order_by=-pulp_created&${collectionCategory.searchKey}=${collectionCategory.searchValue}`
      )
    );
    const results = await Promise.allSettled(searchAPIPromises);
    if (results) {
      results.forEach((result, index) => {
        const categoryAssociatedWithResult = managedCategories[index];
        collectionsInCategories[categoryAssociatedWithResult.id] =
          result.status === 'fulfilled' ? result.value.data : [];
      });
      setCategorizedCollections(collectionsInCategories);
    }
  }, [managedCategories, setCategorizedCollections]);

  useEffect(() => {
    fetchCollectionsForEachCategory().catch((err) => {
      alertToaster.addAlert(errorToAlertProps(err));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managedCategories]);
}
