import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '@ansible/common-ui/columns';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function useTeamColumns(options?: { disableLinks?: boolean; disableSort?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const nameTo = useCallback(
    (item: PlatformTeam) => getPageUrl(PlatformRoute.TeamDetails, { params: { id: item.id } }),
    [getPageUrl]
  );
  const nameColumn = useNameColumn({
    header: t('Name'),
    to: nameTo,
    ...options,
  });
  const organizationNameColumn = useOrganizationNameColumn(
    PlatformRoute.OrganizationDetails,
    options
  );
  const descriptionColumn = useDescriptionColumn();
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

  const tableColumns = useMemo<ITableColumn<PlatformTeam>[]>(
    () => [nameColumn, descriptionColumn, organizationNameColumn, createdColumn, modifiedColumn],
    [createdColumn, descriptionColumn, modifiedColumn, nameColumn, organizationNameColumn]
  );
  return tableColumns;
}
