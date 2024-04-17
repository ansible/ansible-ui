import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../../common/useDynamicFilters';

export function useHostsGroupsFilters(url?: string) {
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
    preSortedKeys: ['name', 'id', 'description', 'created-by', 'modified-by'],
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
