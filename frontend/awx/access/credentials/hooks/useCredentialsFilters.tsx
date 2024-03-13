import { useDynamicToolbarFilters } from '../../common/useDynamicFilters';
import { Credential } from '../../../interfaces/Credential';
import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';

export function useCredentialsFilters() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolBarFilters = useDynamicToolbarFilters<Credential>({
    optionsPath: 'credentials',
    preSortedKeys: ['name'],
    preFilledValueKeys: ['name', 'credential_type'],
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });

  return toolBarFilters;
}
