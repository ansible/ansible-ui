import { useDynamicToolbarFilters } from '@ansible/awx-ui/common/useDynamicFilters';

export function useUserTokensFilters() {
  return useDynamicToolbarFilters({
    optionsPath: 'tokens',
    preSortedKeys: ['description', 'scope', 'id'],
    preFilledValueKeys: {
      id: {
        apiPath: 'tokens',
      },
    },
  });
}
