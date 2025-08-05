import { compareStrings, useBulkConfirmation } from '@ansible/ansible-ui-framework';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { useNameColumn } from '@ansible/common-ui/columns';
import { getItemKey, requestDelete } from '@ansible/common-ui/crud/Data';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useOAuthApplicationColumns } from './useOAuthApplicationColumns';

export function useDeleteOAuthApplications(onComplete: (applications: Application[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useOAuthApplicationColumns({
    disableLinks: true,
    disableSort: true,
  });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useBulkConfirmation<Application>();
  const deleteApplications = (applications: Application[]) => {
    bulkAction({
      title: t('Permanently delete OAuth applications', { count: applications.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} applications.', {
        count: applications.length,
      }),
      actionButtonText: t('Delete OAuth application', { count: applications.length }),
      items: applications.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (application: Application, signal) =>
        requestDelete(gatewayAPI`/applications/${application.id.toString()}/`, signal),
    });
  };
  return deleteApplications;
}
