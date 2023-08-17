// import { useGet } from '../../../common/crud/useGet';
// import { HubItemsResponse } from '../../useHubView';
// import { hubAPI } from '../../api';
import { CollectionCategory } from '../CollectionCategory';
import { useMemo } from 'react';

/**
 * Hook to retrieve the collection categories for the Hub Dashboard UI
 */
export function useCollectionCategories() {
  // NOTE: The following is mock data used for developing this feature while the API endpoint is under development
  const categories = useMemo(() => {
    const mockApiResponse = {
      meta: {
        count: 3,
      },
      data: [
        {
          id: 'networking',
          name: 'Networking collections',
          searchKey: 'tags',
          searchValue: 'networking',
        },
        {
          id: 'storage',
          name: 'Storage collections',
          searchKey: 'tags',
          searchValue: 'storage',
        },
        {
          id: 'eda',
          name: 'Event-Driven Ansible content',
          searchKey: 'tags',
          searchValue: 'eda',
        },
        {
          id: 'database',
          name: 'Database collections',
          searchKey: 'tags',
          searchValue: 'database',
        },
        {
          id: 'cloud',
          name: 'Cloud collections',
          searchKey: 'tags',
          searchValue: 'cloud',
        },
        {
          id: 'application',
          name: 'Application collections',
          searchKey: 'tags',
          searchValue: 'application',
        },
      ] as CollectionCategory[],
      links: {
        next: null,
      },
    };
    const collectionCategories = mockApiResponse.data.map((category) => ({
      selected: true,
      ...category,
    }));
    return collectionCategories;
  }, []);

  return categories;

  // TODO: The mock data above needs to be replaced with the actual API requests when the API becomes available
  // const t = useGet<HubItemsResponse<CollectionCategory>>(
  //   hubAPI`/v3/plugin/ansible/collection-categories/`
  // );
  // return t.data?.data;
}
