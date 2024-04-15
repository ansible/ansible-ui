import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useManagementJobFilters() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'system_job_templates',
    preFilledValueKeys: {
      name: { apiPath: 'system_job_templates' },
      id: { apiPath: 'system_job_templates' },
    },
    preSortedKeys: ['name', 'id', 'created-by', 'modified-by'],
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
