import { useSearchToolbarFilter } from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useUsersFilters() {
  const searchFilter = useSearchToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'users',
    preSortedKeys: ['search', 'username', 'first_name', 'last_name', 'email', 'id'],
    preFilledValueKeys: {
      id: {
        apiPath: 'users',
      },
    },
    additionalFilters: [searchFilter],
  });
  return toolbarFilters;
}
