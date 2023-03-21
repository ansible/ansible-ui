import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageAlertToaster } from '../../../../framework';
import { requestPost } from '../../../common/crud/Data';
import { Team } from '../../interfaces/Team';
import { AccessRole, User } from '../../interfaces/User';

export function useDeleteAccessRole(onComplete?: () => void) {
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const onDeleteRole = useCallback(
    async (role: AccessRole, user: User) => {
      try {
        if (typeof role.team_id !== 'undefined') {
          await requestPost<Team>(`/api/v2/teams/${role.team_id}/roles/`, {
            id: role.id,
            disassociate: true,
          });
        }
        await requestPost<User>(`/api/v2/users/${user.id}/roles/`, {
          id: role.id,
          disassociate: true,
        });
      } catch (err) {
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failed to remove role'),
          children: err instanceof Error && err.message,
        });
      }
      onComplete?.();
    },
    [alertToaster, onComplete, t]
  );
  return onDeleteRole;
}
