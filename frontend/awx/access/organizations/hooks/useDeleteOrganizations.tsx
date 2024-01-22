import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Organization } from '../../../interfaces/Organization';
import { useOrganizationsColumns } from '../Organizations';

export function useDeleteOrganizations(onComplete: (organizations: Organization[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useOrganizationsColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<Organization>();
  const deleteOrganizations = (organizations: Organization[]) => {
    bulkAction({
      title: t('Permanently delete organizations', { count: organizations.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} organizations.', {
        count: organizations.length,
      }),
      actionButtonText: t('Delete organization', { count: organizations.length }),
      items: organizations.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (organization: Organization, signal) =>
        requestDelete(awxAPI`/organizations/${organization.id.toString()}/`, signal),
    });
  };
  return deleteOrganizations;
}
