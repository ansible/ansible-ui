import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { useEdaBulkConfirmation } from '../../../common/useEdaBulkConfirmation';
import { edaAPI } from '../../../common/eda-utils';
import { EdaOrganization } from '../../../interfaces/EdaOrganization';
import { useOrganizationColumns } from './useOrganizationColumns';

export function useDeleteOrganizations(onComplete: (organizations: EdaOrganization[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useOrganizationColumns();
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useEdaBulkConfirmation<EdaOrganization>();
  const deleteOrganizations = (organizations: EdaOrganization[]) => {
    bulkAction({
      title: t('Permanently delete organizations', { count: organizations.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} organizations.', {
        count: organizations.length,
      }),
      actionButtonText: t('Delete organizations', { count: organizations.length }),
      items: organizations.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (organization: EdaOrganization, signal) =>
        requestDelete(edaAPI`/organizations/${organization.id.toString()}/`, signal),
    });
  };
  return deleteOrganizations;
}
