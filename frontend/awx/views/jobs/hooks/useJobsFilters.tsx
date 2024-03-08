import { useDynamicToolbarFilters } from '../../../access/common/useDynamicFilters';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';

export function useJobsFilters() {
  const toolBarFilters = useDynamicToolbarFilters<UnifiedJob>({
    optionsPath: 'unified_jobs',
    preSortedKeys: ['name', 'description', 'status'],
    asyncKeys: {
      name: { resourcePath: 'unified_jobs', params: { order_by: '-finished' } },
      id: { resourcePath: 'unified_jobs', params: { order_by: '-id' } },
      execution_environment: {
        resourcePath: 'execution_environments',
        params: { order_by: '-created' },
        resourceLabelKey: 'name',
        resourceKey: 'id',
      },
      unified_job_template: {
        resourcePath: 'unified_job_templates',
        params: { order_by: '-created' },
        resourceLabelKey: 'name',
        resourceKey: 'id',
      },
    },
  });

  return toolBarFilters;
}
