import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { AwxUser } from '@ansible/awx-ui/interfaces/User';
import { AsyncQueryLabel } from '@ansible/common-ui/AsyncQueryLabel';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryPlatformOptions } from '../../../../common/useQueryPlatformOptions';

export function useLegacyTokensFilters() {
  const { t } = useTranslation();
  // const searchFilter = useSearchToolbarFilter();
  const queryUsers = useQueryPlatformOptions<AwxUser, 'username', 'id'>({
    url: awxAPI`/users/`,
    labelKey: 'username',
    valueKey: 'id',
    orderQuery: 'order_by',
  });
  const queryUserLabel = useCallback(
    (id: string) => <AsyncQueryLabel id={id} url={awxAPI`/users/`} field="username" />,
    []
  );
  const queryApplications = useQueryPlatformOptions<Application, 'name', 'id'>({
    url: awxAPI`/applications/`,
    labelKey: 'name',
    valueKey: 'id',
    orderQuery: 'order_by',
  });
  const queryApplicationLabel = useCallback(
    (id: string) => <AsyncQueryLabel id={id} url={awxAPI`/applications/`} />,
    []
  );

  return useMemo<IToolbarFilter[]>(
    () => [
      // searchFilter, // this does not work in the current API...yet...
      {
        key: 'description',
        label: t('Description'),
        type: ToolbarFilterType.SingleText,
        placeholder: t('Filter by description'),
        comparison: 'contains',
        query: 'description__icontains',
      },
      {
        key: 'user',
        label: t('User'),
        type: ToolbarFilterType.AsyncMultiSelect,
        placeholder: t('Filter by user'),
        query: 'user',
        queryOptions: queryUsers,
        queryLabel: queryUserLabel,
      },
      {
        key: 'scope',
        label: t('Scope'),
        type: ToolbarFilterType.MultiSelect,
        placeholder: t('Filter by scope'),
        options: [
          { label: t('Read'), value: 'read' },
          { label: t('Write'), value: 'write' },
        ],
        query: 'scope__in',
      },
      {
        key: 'application',
        label: t('Application'),
        type: ToolbarFilterType.AsyncMultiSelect,
        placeholder: t('Filter by application'),
        query: 'application',
        queryOptions: queryApplications,
        queryLabel: queryApplicationLabel,
      },
    ],
    [queryApplicationLabel, queryApplications, queryUserLabel, queryUsers, t]
  );
}
