import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageLayout,
  PageHeader,
  usePageNavigate,
  LoadingPage,
  useGetPageUrl,
} from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaRoute } from '../../main/EdaRoutes';

import { EdaAddRoles } from '../common/EdaAddRoles';

export function EdaAddTeamRoles(props: { id?: string; teamRolesRoute?: string }) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const { data: team, isLoading } = useGet<{ id: string; name: string }>(
    edaAPI`/teams/${props.id || params.id || ''}/`
  );

  if (isLoading || !team) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader
        title={t('Add roles')}
        breadcrumbs={[
          { label: t('Teams'), to: getPageUrl(EdaRoute.Teams) },
          {
            label: team.name,
            to: getPageUrl(EdaRoute.TeamPage, { params: { id: team.id } }),
          },
          {
            label: t('Roles'),
            to: getPageUrl(EdaRoute.TeamRoles, { params: { id: team.id } }),
          },
          { label: t('Add roles') },
        ]}
      />
      <EdaAddRoles
        id={team.id.toString()}
        type={'team'}
        onClose={() => {
          pageNavigate(props.teamRolesRoute || EdaRoute.TeamRoles, {
            params: { id: team.id },
          });
        }}
      />
    </PageLayout>
  );
}
