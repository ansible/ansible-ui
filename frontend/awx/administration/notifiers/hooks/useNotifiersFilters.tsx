import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useNotifiersFilters() {
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'notification_templates',
    preSortedKeys: ['name'],
    preFilledValueKeys: ['name', 'id'],
  });
  return toolbarFilters;
}
