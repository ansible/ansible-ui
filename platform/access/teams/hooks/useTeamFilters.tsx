import { useMemo } from 'react';
import { IToolbarFilter } from '../../../../framework';
import { useNameToolbarFilter } from '../../../../frontend/awx/common/awx-toolbar-filters';
import { usePlatformOrganizationsFilter } from '../../organizations/hooks/usePlatformOrganizationsFilter';

export function useTeamFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const organizationsFilter = usePlatformOrganizationsFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [nameToolbarFilter, organizationsFilter],
    [nameToolbarFilter, organizationsFilter]
  );
  return toolbarFilters;
}
