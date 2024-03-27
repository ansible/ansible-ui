import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useProjectsFilters() {
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
    preSortedKeys: ['name', 'id', 'status', 'scm_type', 'created-by', 'modified-by'],
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
