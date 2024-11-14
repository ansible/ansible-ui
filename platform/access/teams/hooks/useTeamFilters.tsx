import { IToolbarFilter } from '@ansible/ansible-ui-framework';
import { useNameToolbarFilter } from '@ansible/awx-ui/common/awx-toolbar-filters';
import { useMemo } from 'react';

export function useTeamFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(() => [nameToolbarFilter], [nameToolbarFilter]);
  return toolbarFilters;
}
