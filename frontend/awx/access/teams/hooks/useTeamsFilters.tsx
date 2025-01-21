import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
  useSearchToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useTeamsFilters() {
  const searchFilter = useSearchToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'teams',
    preSortedKeys: [
      'search',
      'name',
      'description',
      'id',
      'organization',
      'created-by',
      'modified-by',
    ],
    preFilledValueKeys: {
      name: {
        apiPath: 'teams',
      },
      id: {
        apiPath: 'teams',
      },
    },
    additionalFilters: [searchFilter, createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
