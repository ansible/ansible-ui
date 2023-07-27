import { HubItemsResponse } from '../../useHubView';
import { hubAPI } from '../../api';
import { CollectionVersionSearch } from '../../collections/CollectionVersionSearch';
import { CategorizedCollections, CollectionCategory } from '../CollectionCategory';
import { requestGet } from '../../../common/crud/Data';
import { SetStateAction, useCallback, useEffect } from 'react';
import { useCollectionCategories } from './useCollectionCategories';
import { errorToAlertProps, usePageAlertToaster } from '../../../../framework';

export function useCategorizeCollections(
  setCollectionCategories: (value: SetStateAction<CollectionCategory[]>) => void,
  setCategorizedCollections: (value: SetStateAction<CategorizedCollections>) => void
) {
  const collectionCategories = useCollectionCategories();
  const alertToaster = usePageAlertToaster();

  const fetchCollectionsForEachCategory = useCallback(async () => {
    const collectionsInCategories: CategorizedCollections = {};
    const searchAPIPromises = collectionCategories.map((collectionCategory: CollectionCategory) =>
      requestGet<HubItemsResponse<CollectionVersionSearch>>(
        hubAPI`/v3/plugin/ansible/search/collection-versions/?${collectionCategory.searchKey}=${collectionCategory.searchValue}`
      )
    );
    const results = await Promise.allSettled(searchAPIPromises);
    if (results) {
      results.forEach((result, index) => {
        const categoryAssociatedWithResult = collectionCategories[index];
        categoryAssociatedWithResult.showInDashboard =
          result.status === 'fulfilled' && result.value.data.length ? true : false;
        collectionsInCategories[categoryAssociatedWithResult.id] =
          result.status === 'fulfilled' ? result.value.data : [];
      });
      setCollectionCategories(collectionCategories);
      setCategorizedCollections(collectionsInCategories);
    }
  }, [collectionCategories, setCategorizedCollections, setCollectionCategories]);

  useEffect(() => {
    if (collectionCategories) {
      setCollectionCategories(collectionCategories);
    }
    fetchCollectionsForEachCategory().catch((err) => alertToaster.addAlert(errorToAlertProps(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionCategories]);
}
