import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
  useSearchToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useCredentialTypesFilters() {
  const searchFilter = useSearchToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'credential_types',
    preSortedKeys: ['search', 'name', 'id', 'created-by', 'modified-by'],
    preFilledValueKeys: {
      name: {
        apiPath: 'credential_types',
      },
      id: {
        apiPath: 'credential_types',
      },
    },
    additionalFilters: [searchFilter, createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
