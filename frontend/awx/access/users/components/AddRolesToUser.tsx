import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGetItem } from '../../../../common/crud/useGetItem';
import { AwxError } from '../../../common/AwxError';
import { User } from '../../../interfaces/User';
import { AddRolesForm } from '../../roles/AddRolesForm';

export function AddRolesToUser() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: user, refresh } = useGetItem<User>('/api/v2/users', params.id);
  const navigate = useNavigate();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!user) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader title={t('Add Roles to User')} />
      <AddRolesForm users={[user]} onClose={() => navigate(-1)} />
    </PageLayout>
  );
}
