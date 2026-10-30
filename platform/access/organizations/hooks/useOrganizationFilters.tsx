import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { AsyncQueryLabel } from '@ansible/common-ui/AsyncQueryLabel';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryPlatformOptions } from '../../../common/useQueryPlatformOptions';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

/**
 * Toolbar filters for Access Management → Organizations.
 * Uses AsyncMultiSelect for name/id so suggestions appear while typing
 * (parity with Templates / Hosts / Inventories dynamic filters). AAPRFE-3174
 */
export function useOrganizationFilters() {
  const { t } = useTranslation();
  const queryOrganizationsByName = useQueryPlatformOptions<PlatformOrganization, 'name', 'name'>({
    url: gatewayAPI`/organizations/`,
    labelKey: 'name',
    valueKey: 'name',
    orderQuery: 'order_by',
  });
  const queryOrganizationsById = useQueryPlatformOptions<PlatformOrganization, 'name', 'id'>({
    url: gatewayAPI`/organizations/`,
    labelKey: 'name',
    valueKey: 'id',
    orderQuery: 'order_by',
  });
  const queryOrganizationIdLabel = useCallback(
    (id: string) => <AsyncQueryLabel id={id} url={gatewayAPI`/organizations/`} field="name" />,
    []
  );

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.AsyncMultiSelect,
        query: 'name',
        placeholder: t('Select name'),
        queryOptions: queryOrganizationsByName,
        queryLabel: (value: string) => value,
        queryPlaceholder: t('Loading...'),
        queryErrorText: t('Failed to load options.'),
      },
      {
        key: 'id',
        label: t('ID'),
        type: ToolbarFilterType.AsyncMultiSelect,
        query: 'id',
        placeholder: t('Select ID'),
        queryOptions: queryOrganizationsById,
        queryLabel: queryOrganizationIdLabel,
        queryPlaceholder: t('Loading...'),
        queryErrorText: t('Failed to load options.'),
      },
      {
        key: 'description',
        label: t('Description'),
        type: ToolbarFilterType.MultiText,
        query: 'description__icontains',
        comparison: 'contains',
        placeholder: t('Filter by description'),
      },
    ],
    [queryOrganizationIdLabel, queryOrganizationsById, queryOrganizationsByName, t]
  );
}
