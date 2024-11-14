import { IToolbarFilter } from '@ansible/ansible-ui-framework';
import { useNameToolbarFilter } from '@ansible/awx-ui/common/awx-toolbar-filters';
import { useMemo } from 'react';

export function useOrganizationFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(() => [nameToolbarFilter], [nameToolbarFilter]);
  return toolbarFilters;
}
