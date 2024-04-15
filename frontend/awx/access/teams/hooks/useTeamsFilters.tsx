import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useTeamsFilters() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'teams',
    preSortedKeys: ['name', 'description', 'id', 'organization', 'created-by', 'modified-by'],
    preFilledValueKeys: {
      name: {
        apiPath: 'teams',
      },
      id: {
        apiPath: 'teams',
      },
    },
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
