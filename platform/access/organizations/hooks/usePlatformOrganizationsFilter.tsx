import { useMemo } from 'react';
import { ToolbarFilterType } from '../../../../framework';
import { IToolbarAsyncMultiSelectFilter } from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncMultiSelectFilter';
import { AsyncQueryLabel } from '../../../../framework/components/AsyncQueryLabel';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { useQueryPlatformOptions } from '../../../common/useQueryPlatformOptions';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';

export function usePlatformOrganizationsFilter(queryKey: string = 'organization') {
  const queryOptions = useQueryPlatformOptions<PlatformOrganization, 'name', 'id'>({
    url: gatewayAPI`/organizations/`,
    labelKey: 'name',
    valueKey: 'id',
    orderQuery: 'order_by',
  });
  const organizationFilter = useMemo(() => {
    const filter: IToolbarAsyncMultiSelectFilter = {
      key: 'organization',
      query: queryKey,
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
  return organizationFilter;
}
