import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
  useSearchToolbarFilter,
} from '../../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../../common/useDynamicFilters';

export function useHostsGroupsFilters(url?: string) {
  const searchFilter = useSearchToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: url ? url : 'groups',
    preFilledValueKeys: {
      name: {
        apiPath: url ? url : 'groups',
      },
      id: {
        apiPath: url ? url : 'groups',
      },
    },
    preSortedKeys: ['search', 'name', 'id', 'description', 'created-by', 'modified-by'],
    additionalFilters: [searchFilter, createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
