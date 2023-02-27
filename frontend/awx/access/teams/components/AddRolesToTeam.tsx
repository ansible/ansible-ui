import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useItem } from '../../../../common/useItem';
import { Team } from '../../../interfaces/Team';
import { AddRolesForm } from '../../roles/AddRolesForm';

export function AddRolesToTeam() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const team = useItem<Team>('/api/v2/teams', params.id ?? '0');
  const navigate = useNavigate();
  if (!team) return <LoadingPage />;
  return (
    <PageLayout>
      <PageHeader title={t('Add roles to team')} />
      <AddRolesForm teams={[team]} onClose={() => navigate(-1)} />
    </PageLayout>
  );
}
