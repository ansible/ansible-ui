import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useNotificationsFilters() {
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'notification_templates',
    preSortedKeys: ['name'],
    preFilledValueKeys: ['name', 'id'],
  });
  return toolbarFilters;
}
