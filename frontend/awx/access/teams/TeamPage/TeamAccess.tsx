import { UserAccess } from '@ansible/common-ui/access/components/UserAccess';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { AwxRoute } from '../../../main/AwxRoutes';

export function TeamAccess() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  return (
    <UserAccess
      service="awx"
      addRoleButtonText={t('Add users')}
      removeRoleText={t('Remove users')}
      removeConfirmationText={(count: number) =>
        t('Yes, I confirm that I want to remove these {{count}} users.', { count })
      }
      id={params.id || ''}
      type={'team'}
      addRolesRoute={AwxRoute.TeamAddMembers}
    />
  );
}
