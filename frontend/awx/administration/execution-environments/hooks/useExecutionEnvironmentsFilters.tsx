import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';
import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';

export function useExecutionEnvironmentsFilters({
  url,
}: {
  url?: string;
} = {}) {
  const splitUrl = url ? url.split('/') : [];
  const optionsPath = splitUrl[splitUrl.length - 2] || 'execution_environments';
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
