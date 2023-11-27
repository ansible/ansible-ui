import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, useGetPageUrl } from '../../../../framework';
import { PlatformRoute } from '../../../PlatformRoutes';
import {
  useCreatedColumn,
  useModifiedColumn,
  useNameColumn,
} from '../../../../frontend/common/columns';
import { useNavigate } from 'react-router-dom';
import { Organization } from '../../../interfaces/Organization';

export function useOrganizationColumns(options?: {
  disableLinks?: boolean;
  disableSort?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const nameColumnClick = useCallback(
    (organization: Organization) =>
      navigate(getPageUrl(PlatformRoute.OrganizationDetails, { params: { id: organization.id } })),
    [getPageUrl, navigate]
  );
  const nameColumn = useNameColumn({
    header: t('Organization'),
    ...options,
    onClick: nameColumnClick,
  });
  const createdColumn = useCreatedColumn({
    sortKey: 'created_on',
    hideByDefaultInTableView: true,
    ...options,
  });
  const modifiedColumn = useModifiedColumn({
    sortKey: 'modified_on',
    hideByDefaultInTableView: true,
    ...options,
  });

  const tableColumns = useMemo<ITableColumn<Organization>[]>(
    () => [
      nameColumn,
      {
        header: t('Members'),
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
    [createdColumn, modifiedColumn, nameColumn, t]
  );
  return tableColumns;
}
