import { compareStrings, useBulkConfirmation } from '@ansible/ansible-ui-framework';
import { useApplicationsColumns } from '@ansible/awx-ui/administration/applications/hooks/useApplicationsColumns';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { useNameColumn } from '@ansible/common-ui/columns';
import { getItemKey, requestDelete } from '@ansible/common-ui/crud/Data';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useDeleteLegacyApplications(onComplete: (applications: Application[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useApplicationsColumns({
    disableLinks: true,
    disableSort: true,
  });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useBulkConfirmation<Application>();
  const deleteApplications = (applications: Application[]) => {
    bulkAction({
      title: t('Permanently delete legacy applications', { count: applications.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} applications.', {
        count: applications.length,
      }),
      actionButtonText: t('Delete legacy application', { count: applications.length }),
      items: applications.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (application: Application, signal) =>
        requestDelete(awxAPI`/applications/${application.id.toString()}/`, signal),
    });
  };
  return deleteApplications;
}
