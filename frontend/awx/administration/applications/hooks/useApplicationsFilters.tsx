import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useApplicationsFilters() {
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'applications',
    preFilledValueKeys: {
      name: {
        apiPath: 'applications',
      },
      id: {
        apiPath: 'applications',
      },
    },
    preSortedKeys: ['name', 'id', 'description'],
  });
  return toolbarFilters;
}
