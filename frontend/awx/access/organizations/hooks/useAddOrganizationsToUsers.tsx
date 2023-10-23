import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBulkActionDialog } from '../../../../../framework';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { Organization } from '../../../interfaces/Organization';
import { User } from '../../../interfaces/User';

export function useAddOrganizationsToUsers() {
  const { t } = useTranslation();
  const organizationProgressDialog = useBulkActionDialog<Organization>();
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
              `/api/v2/users/${user.id.toString()}/roles/`,
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
