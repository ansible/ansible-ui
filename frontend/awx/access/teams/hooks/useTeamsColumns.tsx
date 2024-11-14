import { ITableColumn, usePageNavigate } from '@ansible/ansible-ui-framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useIdColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '@ansible/common-ui/columns';
import { useCallback, useMemo } from 'react';
import { Team } from '../../../interfaces/Team';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useTeamsColumns(options?: { disableLinks?: boolean; disableSort?: boolean }) {
  const pageNavigate = usePageNavigate();
  const nameColumnClick = useCallback(
    (team: Team) => pageNavigate(AwxRoute.TeamDetails, { params: { id: team.id } }),
    [pageNavigate]
  );
  const idColumn = useIdColumn();
  const nameColumn = useNameColumn({ ...options, onClick: nameColumnClick });
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
