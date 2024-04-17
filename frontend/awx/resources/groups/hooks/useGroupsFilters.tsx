import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
  useGroupTypeToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useGroupsFilters(url?: string) {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const groupTypeToolbarFilter = useGroupTypeToolbarFilter();
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
    preSortedKeys: ['name', 'id', 'description', 'created-by', 'modified-by', 'group'],
    additionalFilters: [modifiedByToolbarFilter, createdByToolbarFilter, groupTypeToolbarFilter],
    removeFilters: ['inventory'],
  });
  return toolbarFilters;
}
