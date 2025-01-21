import { useSearchToolbarFilter } from '@ansible/awx-ui/common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '@ansible/awx-ui/common/useDynamicFilters';

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
