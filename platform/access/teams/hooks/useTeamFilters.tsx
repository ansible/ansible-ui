import { useCallback, useMemo } from 'react';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import { IToolbarAsyncMultiSelectFilter } from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncMultiSelectFilter';
import { useNameToolbarFilter } from '../../../../frontend/awx/common/awx-toolbar-filters';
import { requestGet } from '../../../../frontend/common/crud/Data';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';

export function useTeamFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const queryOrganizations = useCallback(async (page: number) => {
    const organizations = await requestGet<PlatformItemsResponse<PlatformOrganization>>(
      gatewayV1API`/organizations/?page=${page.toString()}`
    );
    return {
      total: organizations.count,
      options: organizations.results.map((organization) => ({
        label: organization.name,
        value: organization.id.toString(),
      })),
    };
  }, []);
  const organizationFilter = useMemo(() => {
    const filter: IToolbarAsyncMultiSelectFilter = {
      key: 'organization',
      query: 'organization',
      label: 'Organization',
      type: ToolbarFilterType.AsyncMultiSelect,
      queryOptions: queryOrganizations,
      placeholder: 'Select organizations',
      queryPlaceholder: 'Loading organizations...',
      queryErrorText: 'Failed to load organizations.',
    };
    return filter;
  }, [queryOrganizations]);

  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [nameToolbarFilter, organizationFilter],
    [nameToolbarFilter, organizationFilter]
  );
  return toolbarFilters;
}
