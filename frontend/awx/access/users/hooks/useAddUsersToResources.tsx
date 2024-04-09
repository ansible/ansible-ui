import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { AwxUser } from '../../../interfaces/User';
import { ResourceType } from '../../common/ResourceAccessList';

export function useAddUsersToResources() {
  const { t } = useTranslation();
  const userProgressDialog = useAwxBulkActionDialog<AwxUser>();
  const postRequest = usePostRequest();
  const addUserToTeams = useCallback(
    (users: AwxUser[], resources: ResourceType[], onComplete?: (users: AwxUser[]) => void) => {
      userProgressDialog({
        title: t('Adding users', { count: resources.length }),
        keyFn: (user: AwxUser) => user.id,
        items: users,
        actionColumns: [{ header: 'User', cell: (user: AwxUser) => user.username }],
        actionFn: async (user: AwxUser, signal: AbortSignal) => {
          for (const resource of resources) {
            await postRequest(
              awxAPI`/users/${user.id.toString()}/roles/`,
              { id: resource.summary_fields.object_roles.member_role.id },
              signal
            );
          }
        },
        processingText: t('Adding users...', { count: resources.length }),
        onComplete,
      });
    },
    [userProgressDialog, t, postRequest]
  );
  return addUserToTeams;
}
