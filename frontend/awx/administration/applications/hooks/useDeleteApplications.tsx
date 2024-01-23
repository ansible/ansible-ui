import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Application } from '../../../interfaces/Application';
import { useApplicationsColumns } from './useApplicationsColumns';

export function useDeleteApplications(onComplete: (applications: Application[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useApplicationsColumns({
    disableLinks: true,
    disableSort: true,
  });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<Application>();
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
        requestDelete(awxAPI`/applications/${application.id.toString()}/`, signal),
    });
  };
  return deleteApplications;
}
