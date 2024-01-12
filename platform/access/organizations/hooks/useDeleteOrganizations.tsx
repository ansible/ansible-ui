import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { useNameColumn } from '../../../../frontend/common/columns';
import { getItemKey, requestDelete } from '../../../../frontend/common/crud/Data';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useOrganizationColumns } from './useOrganizationColumns';

export function useDeleteOrganizations(
  onComplete: (organizations: PlatformOrganization[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useOrganizationColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({
    header: t('Organization'),
    disableLinks: true,
    disableSort: true,
  });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  // TODO: Update based on RBAC information from Organizations API
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cannotDeleteOrganization = (organization: PlatformOrganization) => {
    // eslint-disable-next-line no-constant-condition
    return true //organization?.summary_fields?.user_capabilities?.delete
      ? undefined
      : t('The organization cannot be deleted due to insufficient permissions.');
  };
  const bulkAction = useBulkConfirmation<PlatformOrganization>();
  const getAlertPrompts = useCallback(
    (organizations: PlatformOrganization[], undeletableOrganizations: PlatformOrganization[]) => {
      const alertPrompts = [
        t('Deleting these organizations could impact other resources that rely on them.', {
          count: organizations.length,
        }),
      ];
      if (undeletableOrganizations.length > 0) {
        alertPrompts.push(
          t(
            '{{count}} of the selected organizations cannot be deleted due to insufficient permissions.',
            {
              count: undeletableOrganizations.length,
            }
          )
        );
      }
      return alertPrompts;
    },
    [t]
  );
  const deleteOrganizations = (organizations: PlatformOrganization[]) => {
    const undeletableOrganizations = organizations.filter(cannotDeleteOrganization);

    bulkAction({
      title: t('Permanently delete organizations', { count: organizations.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} organizations.', {
        count: organizations.length - undeletableOrganizations.length,
      }),
      actionButtonText: t('Delete organizations', { count: organizations.length }),
      items: organizations.sort((l, r) => compareStrings(l.name, r.name)),
      alertPrompts: getAlertPrompts(organizations, undeletableOrganizations),
      isItemNonActionable: cannotDeleteOrganization,
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (organization: PlatformOrganization, signal) =>
        requestDelete(gatewayAPI`/organizations/${organization.id.toString()}/`, signal),
    });
  };
  return deleteOrganizations;
}
