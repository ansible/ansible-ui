import {
  useCreatedByToolbarFilter,
  useGroupTypeToolbarFilter,
  useModifiedByToolbarFilter,
  useSearchToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useGroupsFilters({
  url,
  queryParams,
}: {
  url?: string;
  queryParams?: Record<string, string>;
}) {
  const searchFilter = useSearchToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const groupTypeToolbarFilter = useGroupTypeToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: url ? url : 'groups',
    preFilledValueKeys: {
      name: {
        apiPath: url ? url : 'groups',
        queryParams: queryParams ? queryParams : {},
      },
      id: {
        apiPath: url ? url : 'groups',
        queryParams: queryParams ? queryParams : {},
      },
    },
    preSortedKeys: ['search', 'name', 'id', 'description', 'created-by', 'modified-by', 'group'],
    additionalFilters: [
      searchFilter,
      modifiedByToolbarFilter,
      createdByToolbarFilter,
      groupTypeToolbarFilter,
    ],
    removeFilters: ['inventory'],
  });
  return toolbarFilters;
}
