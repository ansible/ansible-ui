/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TeamAccess } from '@ansible/common-ui/access/components/TeamAccess';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';

export function OrganizationTeamsAccess() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  return (
    <TeamAccess
      service="awx"
      id={params.id || ''}
      type={'organization'}
      addRoleButtonText={t('Add team')}
      removeRoleText={t('Remove team')}
      removeConfirmationText={(count: number) =>
        t('Yes, I confirm that I want to remove these {{count}} teams.', { count })
      }
      addRolesRoute={AwxRoute.OrganizationAddTeams as string}
    />
  );
}
