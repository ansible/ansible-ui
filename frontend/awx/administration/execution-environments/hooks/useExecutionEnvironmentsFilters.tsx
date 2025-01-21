import { awxApiPath } from '../../../common/api/awx-utils';
import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
  useSearchToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useExecutionEnvironmentsFilters({
  url,
}: {
  url?: string;
} = {}) {
  const urlPath = url ? url.replace(awxApiPath, '') : '';
  const optionsPath = urlPath || 'execution_environments';
  const searchFilter = useSearchToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: optionsPath,
    preSortedKeys: ['search', 'name', 'id', 'image', 'created-by', 'modified-by'],
    preFilledValueKeys: {
      id: {
        apiPath: optionsPath,
      },
      name: {
        apiPath: optionsPath,
      },
    },
    additionalFilters: [searchFilter, createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
