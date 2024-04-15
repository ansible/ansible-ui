import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useInstancesFilters() {
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'instances',
    preSortedKeys: ['hostname', 'node_type', 'id'],
    preFilledValueKeys: {
      hostname: { apiPath: 'instances' },
      id: { apiPath: 'instances' },
    },
  });
  return toolbarFilters;
}
