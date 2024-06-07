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
import { awxAPI } from '../../common/api/awx-utils';
import { AwxRoute } from '../../main/AwxRoutes';
import { AwxAddRoles } from '../common/AwxAddRoles';

export function AwxAddTeamRoles(props: { id?: string; teamRolesRoute?: string }) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const { data: team, isLoading } = useGet<{ id: string; name: string }>(
    awxAPI`/teams/${props.id || params.id || ''}/`
  );

  if (isLoading || !team) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader
        title={t('Add roles')}
        breadcrumbs={[
          { label: t('Teams'), to: getPageUrl(AwxRoute.Teams) },
          {
            label: team.name,
            to: getPageUrl(AwxRoute.TeamDetails, { params: { id: 1 } }),
          },
          {
            label: t('Roles'),
            to: getPageUrl(AwxRoute.TeamRoles, { params: { id: 1 } }),
          },
          { label: t('Add roles') },
        ]}
      />
      <AwxAddRoles
        id={team.id.toString()}
        type={'team'}
        onClose={() => {
          pageNavigate(props.teamRolesRoute || AwxRoute.TeamRoles, {
            params: { id: team.id },
          });
        }}
      />
    </PageLayout>
  );
}
