import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';
import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { awxApiPath } from '../../../common/api/awx-utils';

export function useExecutionEnvironmentsFilters({
  url,
}: {
  url?: string;
} = {}) {
  const urlPath = url ? url.replace(awxApiPath, '') : '';
  const optionsPath = urlPath || 'execution_environments';
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: optionsPath,
    preSortedKeys: ['name', 'id', 'image', 'created-by', 'modified-by'],
    preFilledValueKeys: {
      id: {
        apiPath: optionsPath,
      },
      name: {
        apiPath: optionsPath,
      },
    },
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
