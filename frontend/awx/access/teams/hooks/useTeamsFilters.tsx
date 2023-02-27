import { useMemo } from 'react';
import { IToolbarFilter } from '../../../../../framework';
import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
  useOrganizationToolbarFilter,
} from '../../../common/awx-toolbar-filters';

export function useTeamsFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const organizationToolbarFilter = useOrganizationToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      organizationToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [nameToolbarFilter, organizationToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
  );
  return toolbarFilters;
}
