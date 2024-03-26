import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';
import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';

export function useCredentialsFilters() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolBarFilters = useDynamicToolbarFilters({
    optionsPath: 'credentials',
    preSortedKeys: ['name', 'credential_type', 'created-by', 'modified-by'],
    preFilledValueKeys: ['name', 'credential_type', 'id'],
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });

  return toolBarFilters;
}
