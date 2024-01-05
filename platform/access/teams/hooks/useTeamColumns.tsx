import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, useGetPageUrl } from '../../../../framework';
import {
  useCreatedColumn,
  useIdColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '../../../../frontend/common/columns';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function useTeamColumns(options?: { disableLinks?: boolean; disableSort?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const idColumn = useIdColumn();
  const nameColumnClick = useCallback(
    (team: PlatformTeam) =>
      navigate(getPageUrl(PlatformRoute.TeamDetails, { params: { id: team.id } })),
    [getPageUrl, navigate]
  );
  const nameColumn = useNameColumn({ header: t('Name'), ...options, onClick: nameColumnClick });
  const organizationNameColumn = useOrganizationNameColumn(
    PlatformRoute.OrganizationDetails,
    options
  );
  const createdColumn = useCreatedColumn({
    sortKey: 'created_on',
    // hideByDefaultInTableView: true,
    ...options,
  });
  const modifiedColumn = useModifiedColumn({
    sortKey: 'modified_on',
    // hideByDefaultInTableView: true,
    ...options,
  });

  const tableColumns = useMemo<ITableColumn<PlatformTeam>[]>(
    () => [
      idColumn,
      nameColumn,
      {
        header: t('Members'),
        type: 'count',
        value: (team) => team.users.length,
      },
      organizationNameColumn,
      createdColumn,
      modifiedColumn,
    ],
    [createdColumn, idColumn, modifiedColumn, nameColumn, organizationNameColumn, t]
  );
  return tableColumns;
}
