import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useUsersFilters() {
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'users',
    preSortedKeys: ['username', 'first_name', 'last_name', 'email', 'id'],
    preFilledValueKeys: {
      id: {
        apiPath: 'users',
      },
    },
  });
  return toolbarFilters;
}
