import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { usePlatformView } from '@ansible/platform-ui/hooks/usePlatformView';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { useTeamRolesColumns } from '@ansible/platform-ui/access/teams/hooks/useTeamRolesColumns';
import { PlatformRoute } from '@ansible/platform-ui/main/PlatformRoutes';
import type { TeamAssignment } from '@ansible/common-ui/access/interfaces/TeamAssignment';

type TeamSummary = { id: number; name: string };

export function useIndirectTeamRolesView(userId: string) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const baseColumns = useTeamRolesColumns();

  const { data: teams } = useGet<{ results: TeamSummary[] }>(
    userId ? gatewayAPI`/users/${userId}/teams/` : undefined
  );
  const teamIdsParam = (teams?.results ?? []).map((t) => t.id).join(',');

  const tableColumns = useMemo(
    () => [
      ...baseColumns.map(({ sort, ...rest }) => rest),
      {
        header: t('Inherited from'),
        cell: (resource: TeamAssignment) => {
          const teamName = resource.summary_fields?.team?.name;
          const teamId = resource.summary_fields?.team?.id;
          return teamName && teamId ? (
            <Link to={getPageUrl(PlatformRoute.TeamDetails, { params: { id: teamId } })}>
              {teamName}
            </Link>
          ) : (
            ''
          );
        },
      },
    ],
    [baseColumns, getPageUrl, t]
  );

  const view = usePlatformView<TeamAssignment>({
    url: gatewayAPI`/role_team_assignments/`,
    queryParams: teamIdsParam ? { team__in: teamIdsParam } : { team__in: '0' },
    tableColumns,
    disableQueryString: true,
    defaultSort: undefined,
  });

  return { view, tableColumns };
}
