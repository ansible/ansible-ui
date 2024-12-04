import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
} from '@ansible/common-ui/columns';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function useOrganizationColumns(options?: {
  disableLinks?: boolean;
  disableSort?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const nameTo = useCallback(
    (item: PlatformOrganization) =>
      getPageUrl(PlatformRoute.OrganizationDetails, { params: { id: item.id } }),
    [getPageUrl]
  );
  const nameColumn = useNameColumn({
    header: t('Name'),
    to: nameTo,
    ...options,
  });
  const createdColumn = useCreatedColumn({
    sort: 'created',
    userDetailsPageId: PlatformRoute.UserDetails,
    // hideByDefaultInTableView: true,
    ...options,
  });
  const modifiedColumn = useModifiedColumn({
    sort: 'modified',
    userDetailsPageId: PlatformRoute.UserDetails,
    // hideByDefaultInTableView: true,
    ...options,
  });
  const descriptionColumn = useDescriptionColumn();

  const tableColumns = useMemo<ITableColumn<PlatformOrganization>[]>(
    () => [
      nameColumn,
      descriptionColumn,
      {
        header: t('Users'),
        type: 'count',
        value: (organization) => organization.summary_fields?.related_field_counts?.users,
      },
      {
        header: t('Teams'),
        type: 'count',
        value: (organization) => organization.summary_fields?.related_field_counts?.teams,
      },
      createdColumn,
      modifiedColumn,
    ],
    [createdColumn, descriptionColumn, modifiedColumn, nameColumn, t]
  );
  return tableColumns;
}
