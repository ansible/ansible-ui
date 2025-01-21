import { useSearchToolbarFilter } from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useWorkflowApprovalsFilters() {
  const searchFilter = useSearchToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'workflow_approvals',
    preFilledValueKeys: {
      name: { apiPath: 'workflow_approvals' },
      id: { apiPath: 'workflow_approvals' },
    },
    preSortedKeys: ['search', 'name', 'id'],
    additionalFilters: [searchFilter],
  });
  return toolbarFilters;
}
