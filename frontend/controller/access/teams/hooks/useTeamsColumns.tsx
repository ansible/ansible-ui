import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn } from '../../../../../framework';
import {
  useCreatedColumn,
  useIdColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '../../../../common/columns';
import { RouteE } from '../../../../Routes';
import { Team } from '../../../interfaces/Team';

export function useTeamsColumns(options?: { disableLinks?: boolean; disableSort?: boolean }) {
  const { t } = useTranslation();
  const history = useNavigate();
  const nameColumnClick = useCallback(
    (team: Team) => history(RouteE.TeamDetails.replace(':id', team.id.toString())),
    [history]
  );
  const idColumn = useIdColumn();
  const nameColumn = useNameColumn({ header: t('Team'), ...options, onClick: nameColumnClick });
  const organizationColumn = useOrganizationNameColumn(options);
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<Team>[]>(
    () => [idColumn, nameColumn, organizationColumn, createdColumn, modifiedColumn],
    [createdColumn, idColumn, modifiedColumn, nameColumn, organizationColumn]
  );
  return tableColumns;
}
