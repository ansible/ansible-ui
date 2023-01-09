import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../framework';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { useItem } from '../../../common/useItem';
import { User } from '../../interfaces/User';
import { AddRolesToUsersForm } from '../roles/UserRolesForm';

export function AddRolesToUser() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const user = useItem<User>('/api/v2/users', params.id ?? '0');
  const navigate = useNavigate();
  if (!user) return <LoadingPage />;
  return (
    <PageLayout>
      <PageHeader title={t('Add roles to user')} />
      <AddRolesToUsersForm users={[user]} onClose={() => navigate(-1)} />
    </PageLayout>
  );
}
