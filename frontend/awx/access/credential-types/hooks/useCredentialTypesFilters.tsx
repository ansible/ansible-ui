import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';
import { CredentialType } from '../../../interfaces/CredentialType';

export function useCredentialTypesFilters() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters<CredentialType>({
    optionsPath: 'credential_types',
    preSortedKeys: ['name'],
    preFilledValueKeys: ['name'],
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
