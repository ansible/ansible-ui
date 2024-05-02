import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';
import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';

export function useExecutionEnvironmentsFilters() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'execution_environments',
    preSortedKeys: ['name', 'id', 'image', 'created-by', 'modified-by'],
    preFilledValueKeys: {
      id: {
        apiPath: 'execution_environments',
      },
      name: {
        apiPath: 'execution_environments',
      },
    },
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
