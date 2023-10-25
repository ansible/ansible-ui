import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn } from '../../../../../framework';
import { RouteObj } from '../../../../common/Routes';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useIdColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '../../../../common/columns';
import { Team } from '../../../interfaces/Team';
import { AwxRoute } from '../../../AwxRoutes';

export function useTeamsColumns(options?: { disableLinks?: boolean; disableSort?: boolean }) {
  const { t } = useTranslation();
  const history = useNavigate();
  const nameColumnClick = useCallback(
    (team: Team) => history(RouteObj.TeamDetails.replace(':id', team.id.toString())),
    [history]
  );
  const idColumn = useIdColumn();
  const nameColumn = useNameColumn({ header: t('Team'), ...options, onClick: nameColumnClick });
  const descriptionColumn = useDescriptionColumn();

  const organizationColumn = useOrganizationNameColumn(AwxRoute.OrganizationDetails, options);
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<Team>[]>(
    () => [
      idColumn,
      nameColumn,
      organizationColumn,
      descriptionColumn,
      createdColumn,
      modifiedColumn,
    ],
    [createdColumn, descriptionColumn, idColumn, modifiedColumn, nameColumn, organizationColumn]
  );
  return tableColumns;
}
