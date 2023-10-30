import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, useGetPageUrl } from '../../../../framework';
import { PlatformRoute } from '../../../PlatformRoutes';
import {
  useCreatedColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '../../../../frontend/common/columns';
import { useNavigate } from 'react-router-dom';
import { Team } from '../../../interfaces/Team';

export function useTeamColumns(options?: { disableLinks?: boolean; disableSort?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const nameColumnClick = useCallback(
    (team: Team) => navigate(getPageUrl(PlatformRoute.TeamDetails, { params: { id: team.id } })),
    [getPageUrl, navigate]
  );
  const nameColumn = useNameColumn({ header: t('Team'), ...options, onClick: nameColumnClick });
  const organizationNameColumn = useOrganizationNameColumn(
    PlatformRoute.OrganizationDetails,
    options
  );
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

  const tableColumns = useMemo<ITableColumn<Team>[]>(
    () => [nameColumn, organizationNameColumn, createdColumn, modifiedColumn],
    [createdColumn, modifiedColumn, nameColumn, organizationNameColumn]
  );
  return tableColumns;
}
