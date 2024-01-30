import { SetStateAction, useCallback, useEffect } from 'react';
import { errorToAlertProps, usePageAlertToaster } from '../../../../framework';
import { requestGet } from '../../../common/crud/Data';
import { CollectionVersionSearch } from '../../collections/Collection';
import { hubAPI } from '../../common/api/formatPath';
import { HubItemsResponse } from '../../common/useHubView';
import { CategorizedCollections, CollectionCategory } from '../CollectionCategory';

export const MAX_NUMBER_OF_COLLECTIONS = 12;

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
        hubAPI`/v3/plugin/ansible/search/collection-versions/?limit=${MAX_NUMBER_OF_COLLECTIONS}&order_by=-pulp_created&${collectionCategory.searchKey}=${collectionCategory.searchValue}`
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
