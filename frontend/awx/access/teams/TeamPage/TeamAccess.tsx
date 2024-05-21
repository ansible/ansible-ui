import { useParams } from 'react-router-dom';
import { UserAccess } from '../../../../common/access/components/UserAccess';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useTranslation } from 'react-i18next';

export function TeamAccess() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  return (
    <UserAccess
      service="awx"
      addRoleButtonText={t('Add users')}
      removeRoleText={t('Remove users')}
      removeConfirmationText={t('Yes, I confirm that I want to remove these {{count}} users.')}
      id={params.id || ''}
      type={'team'}
      addRolesRoute={AwxRoute.TeamAddMembers}
    />
  );
}
