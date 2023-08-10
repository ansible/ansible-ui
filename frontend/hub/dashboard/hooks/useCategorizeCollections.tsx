import { HubItemsResponse } from '../../useHubView';
import { hubAPI } from '../../api/utils';
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
    const searchAPIPromises = managedCategories.map((collectionCategory: CollectionCategory) =>
      requestGet<HubItemsResponse<CollectionVersionSearch>>(
        hubAPI`/v3/plugin/ansible/search/collection-versions/?${collectionCategory.searchKey}=${collectionCategory.searchValue}`
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
