import { useSearchToolbarFilter } from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useUserTokensFilters() {
  const searchFilter = useSearchToolbarFilter();
  return useDynamicToolbarFilters({
    optionsPath: 'tokens',
    preSortedKeys: ['search', 'description', 'scope', 'id'],
    preFilledValueKeys: {
      id: {
        apiPath: 'tokens',
      },
    },
    additionalFilters: [searchFilter],
  });
}
