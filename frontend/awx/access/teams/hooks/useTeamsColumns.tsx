import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
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
  const getPageUrl = useGetPageUrl();
  const idColumn = useIdColumn();
  const nameTo = useCallback(
    (team: Team) => getPageUrl(AwxRoute.TeamDetails, { params: { id: team.id } }),
    [getPageUrl]
  );
  const nameColumn = useNameColumn({
    ...options,
    to: nameTo,
  });
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
