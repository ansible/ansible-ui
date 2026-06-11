import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
  useSearchToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useProjectsFilters() {
  const searchFilter = useSearchToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'projects',
    preFilledValueKeys: {
      name: {
        apiPath: 'projects',
      },
      id: {
        apiPath: 'projects',
      },
    },
    preSortedKeys: ['search', 'name', 'id', 'status', 'scm_type', 'created-by', 'modified-by'],
    additionalFilters: [searchFilter, createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
