import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useTemplateFilters() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'unified_job_templates',
    preSortedKeys: ['name', 'description', 'status', 'created-by', 'modified-by'],
    preFilledValueKeys: {
      name: {
        apiPath: 'unified_job_templates',
        queryParams: { type: 'job_template,workflow_job_template' },
      },
      id: {
        apiPath: 'unified_job_templates',
        queryParams: { type: 'job_template,workflow_job_template' },
      },
    },
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
