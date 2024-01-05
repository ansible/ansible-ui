import { useMemo } from 'react';
import { IToolbarFilter } from '../../../../framework';
import { useNameToolbarFilter } from '../../../../frontend/awx/common/awx-toolbar-filters';

export function useOrganizationFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(() => [nameToolbarFilter], [nameToolbarFilter]);
  return toolbarFilters;
}
