import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGetItem } from '../../../../common/crud/useGetItem';
import { AwxError } from '../../../common/AwxError';
import { Team } from '../../../interfaces/Team';
import { AddRolesForm } from '../../roles/AddRolesForm';

export function AddRolesToTeam() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: team, refresh } = useGetItem<Team>('/api/v2/teams', params.id);
  const navigate = useNavigate();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!team) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader title={t('Add roles to team')} />
      <AddRolesForm teams={[team]} onClose={() => navigate(-1)} />
    </PageLayout>
  );
}
