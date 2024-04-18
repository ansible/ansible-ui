import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useExecutionEnvironmentsFilters() {
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'execution_environments',
    preSortedKeys: ['name', 'id'],
    preFilledValueKeys: {
      name: {
        apiPath: 'execution_environments',
      },
      id: {
        apiPath: 'execution_environments',
      },
    },
  });
  return toolbarFilters;
}
