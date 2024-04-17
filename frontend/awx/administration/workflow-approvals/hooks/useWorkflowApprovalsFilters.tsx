import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useWorkflowApprovalsFilters() {
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'workflow_approvals',
    preFilledValueKeys: {
      name: { apiPath: 'workflow_approvals' },
      id: { apiPath: 'workflow_approvals' },
    },
    preSortedKeys: ['name', 'id'],
  });
  return toolbarFilters;
}
