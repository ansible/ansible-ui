import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useNotifiersFilters() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'notification_templates',
    preSortedKeys: ['name', 'id', 'created-by', 'modified-by'],
    preFilledValueKeys: {
      name: { apiPath: 'notification_templates' },
      id: { apiPath: 'notification_templates' },
    },
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
