import { useMemo } from 'react';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import { IToolbarAsyncMultiSelectFilter } from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncMultiSelectFilter';
import { AsyncQueryLabel } from '../../../../framework/components/AsyncQueryLabel';
import { useNameToolbarFilter } from '../../../../frontend/awx/common/awx-toolbar-filters';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { useQueryPlatformOptions } from '../../../common/useQueryPlatformOptions';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';

export function useTeamFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const queryOptions = useQueryPlatformOptions<PlatformOrganization, 'name', 'id'>({
    url: gatewayAPI`/organizations/`,
    labelKey: 'name',
    valueKey: 'id',
    orderQuery: 'order_by',
  });
  const organizationFilter = useMemo(() => {
    const filter: IToolbarAsyncMultiSelectFilter = {
      key: 'organization',
      query: 'organization',
      label: 'Organization',
      type: ToolbarFilterType.AsyncMultiSelect,
      queryOptions,
      placeholder: 'Select organizations',
      queryPlaceholder: 'Loading organizations...',
      queryErrorText: 'Failed to load organizations.',
      queryLabel: (id: string) => <AsyncQueryLabel id={id} url={gatewayAPI`/organizations/`} />,
    };
    return filter;
  }, [queryOptions]);

  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [nameToolbarFilter, organizationFilter],
    [nameToolbarFilter, organizationFilter]
  );
  return toolbarFilters;
}
