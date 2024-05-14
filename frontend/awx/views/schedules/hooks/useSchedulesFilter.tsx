import { awxApiPath } from '../../../common/api/awx-utils';
import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useSchedulesFilter({
  url,
}: {
  url?: string;
} = {}) {
  const urlPath = url ? url.replace(awxApiPath, '') : '';
  const optionsPath = urlPath || 'schedules';
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();

  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: optionsPath,
    preSortedKeys: ['name', 'id', 'created-by', 'modified-by'],
    preFilledValueKeys: {
      name: {
        apiPath: optionsPath,
      },
      id: {
        apiPath: optionsPath,
      },
    },
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
