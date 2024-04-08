import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageAlertToaster } from '../../../../framework';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { awxAPI } from '../../common/api/awx-utils';
import { AccessRole, AwxUser } from '../../interfaces/User';

export function useDeleteAccessRole(onComplete?: () => void) {
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const postRequest = usePostRequest();
  const onDeleteRole = useCallback(
    async (role: AccessRole, user: AwxUser) => {
      try {
        if (typeof role.team_id !== 'undefined') {
          await postRequest(awxAPI`/teams/${role.team_id.toString()}/roles/`, {
            id: role.id,
            disassociate: true,
          });
        }
        await postRequest(awxAPI`/users/${user.id.toString()}/roles/`, {
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
    [alertToaster, onComplete, postRequest, t]
  );
  return onDeleteRole;
}
