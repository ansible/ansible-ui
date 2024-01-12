import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { Team } from '../../../interfaces/Team';
import { AddRolesForm } from '../../roles/AddRolesForm';

export function AddRolesToTeam() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: team, refresh } = useGetItem<Team>(awxAPI`/teams`, params.id);
  const navigate = useNavigate();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!team) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader title={t('Add Roles to Team')} />
      <AddRolesForm teams={[team]} onClose={() => navigate(-1)} />
    </PageLayout>
  );
}
