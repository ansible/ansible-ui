import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../framework';
import { useApplicationsColumns } from '../../../../frontend/awx/administration/applications/hooks/useApplicationsColumns';
import { Application } from '../../../../frontend/awx/interfaces/Application';
import { useNameColumn } from '../../../../frontend/common/columns';
import { getItemKey, requestDelete } from '../../../../frontend/common/crud/Data';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useBulkConfirmation } from '../../../../framework';

export function useDeleteApplications(onComplete: (applications: Application[]) => void) {
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
      title: t('Permanently delete applications', { count: applications.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} applications.', {
        count: applications.length,
      }),
      actionButtonText: t('Delete application', { count: applications.length }),
      items: applications.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (application: Application, signal) =>
        requestDelete(gatewayV1API`/applications/${application.id.toString()}/`, signal),
    });
  };
  return deleteApplications;
}
