import { useMemo } from 'react';
import { IToolbarFilter } from '../../../../../framework';
import { useNameToolbarFilter } from '../../../common/awx-toolbar-filters';

export function useNotificationsFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(() => [nameToolbarFilter], [nameToolbarFilter]);
  return toolbarFilters;
}
