import { ITableColumn, LabelsCell, TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TeamRoleEntry } from '../../organizations/hooks/useOrganizationTeamsWithRoles';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function useOrganizationTeamColumns(
  rolesByTeamId: Map<number, TeamRoleEntry[]>,
  options?: { disableLinks?: boolean }
) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const tableColumns = useMemo<ITableColumn<PlatformTeam>[]>(
    () => [
      {
        header: t('Name'),
        cell: (team) => (
          <TextCell
            text={team?.name}
            to={
              options?.disableLinks
                ? undefined
                : getPageUrl(PlatformRoute.TeamDetails, { params: { id: team?.id } })
            }
          />
        ),
        card: 'name',
        list: 'name',
        sort: 'name',
        maxWidth: 200,
        defaultSort: true,
      },
      {
        header: t('Organization'),
        type: 'text',
        value: (team) => team?.summary_fields?.organization?.name,
        sort: 'organization',
      },
      {
        header: t('Organization roles'),
        cell: (team: PlatformTeam) => (
          <LabelsCell
            labelsWithLinks={(rolesByTeamId.get(team.id) ?? []).map(({ name, id }) => ({
              name,
              link: getPageUrl(PlatformRoute.RoleDetails, { params: { id } }),
            }))}
          />
        ),
      },
    ],
    [getPageUrl, options?.disableLinks, rolesByTeamId, t]
  );
  return tableColumns;
}
