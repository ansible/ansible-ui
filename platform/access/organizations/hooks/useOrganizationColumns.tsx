import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, useGetPageUrl } from '../../../../framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
} from '../../../../frontend/common/columns';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function useOrganizationColumns(options?: {
  disableLinks?: boolean;
  disableSort?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const nameColumnClick = useCallback(
    (organization: PlatformOrganization) =>
      navigate(getPageUrl(PlatformRoute.OrganizationDetails, { params: { id: organization.id } })),
    [getPageUrl, navigate]
  );
  const nameColumn = useNameColumn({
    header: t('Name'),
    ...options,
    onClick: nameColumnClick,
  });
  const createdColumn = useCreatedColumn({
    sort: 'created_on',
    // hideByDefaultInTableView: true,
    ...options,
  });
  const modifiedColumn = useModifiedColumn({
    sort: 'modified_on',
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
