import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../api/awx-utils';
import { Organization } from '../../../interfaces/Organization';
import { User } from '../../../interfaces/User';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';

export function useAddOrganizationsToUsers() {
  const { t } = useTranslation();
  const organizationProgressDialog = useAwxBulkActionDialog<Organization>();
  const postRequest = usePostRequest<{ id: number }, Organization>();

  const addUserToOrganizations = useCallback(
    (
      users: User[],
      organizations: Organization[],
      onComplete?: (organizations: Organization[]) => void
    ) => {
      organizationProgressDialog({
        title: t('Adding users to organizations', {
          count: organizations.length,
        }),
        keyFn: (organization: Organization) => organization.id,
        items: organizations,
        actionColumns: [
          { header: t('Organization'), cell: (organization: Organization) => organization.name },
        ],
        actionFn: async (organization: Organization, signal: AbortSignal) => {
          for (const user of users) {
            await postRequest(
              awxAPI`/users/${user.id.toString()}/roles/`,
              { id: organization.summary_fields.object_roles.member_role.id },
              signal
            );
          }
        },
        processingText: t('Adding user to organizations...', {
          count: organizations.length,
        }),
        onComplete,
      });
    },
    [organizationProgressDialog, postRequest, t]
  );
  return addUserToOrganizations;
}
