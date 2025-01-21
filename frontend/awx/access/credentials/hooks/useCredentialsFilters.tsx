import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
  useSearchToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useCredentialsFilters() {
  const searchFilter = useSearchToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolBarFilters = useDynamicToolbarFilters({
    optionsPath: 'credentials',
    preSortedKeys: ['search', 'name', 'credential_type', 'created-by', 'modified-by'],
    preFilledValueKeys: { name: { apiPath: 'credentials' }, id: { apiPath: 'credentials' } },
    additionalFilters: [searchFilter, createdByToolbarFilter, modifiedByToolbarFilter],
  });

  return toolBarFilters;
}
