import { useDynamicToolbarFilters } from '../../../access/common/useDynamicFilters';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';

export function useJobsFilters() {
  const toolBarFilters = useDynamicToolbarFilters<UnifiedJob>({
    optionsPath: 'unified_jobs',
    preSortedKeys: ['name', 'description', 'status'],
    asyncFilterKeys: {
      name: { resourceType: 'unified_jobs', params: { order_by: '-finished' } },
      id: { resourceType: 'unified_jobs', params: { order_by: '-id' } },
      execution_environment: {
        resourceType: 'execution_environments',
        params: { order_by: '-created' },
        labelKey: 'name',
        valueKey: 'id',
      },
      unified_job_template: {
        resourceType: 'unified_job_templates',
        params: { order_by: '-created' },
        labelKey: 'name',
        valueKey: 'id',
      },
    },
  });

  return toolBarFilters;
}
