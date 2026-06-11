import { useSearchToolbarFilter } from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useApplicationsFilters() {
  const searchFilter = useSearchToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'applications',
    preFilledValueKeys: {
      name: {
        apiPath: 'applications',
      },
      id: {
        apiPath: 'applications',
      },
    },
    preSortedKeys: ['search', 'name', 'id', 'description'],
    additionalFilters: [searchFilter],
  });
  return toolbarFilters;
}
