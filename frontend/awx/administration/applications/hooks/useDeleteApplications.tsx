import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../api/awx-utils';
import { Application } from '../../../interfaces/Application';
import { useApplicationsColumns } from '../Applications';

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
      title:
        applications.length === 1
          ? t('Permanently delete executionEnvironment')
          : t('Permanently delete executionEnvironments'),
      confirmText: t(
        'Yes, I confirm that I want to delete these {{count}} executionEnvironments.',
        { count: applications.length }
      ),
      actionButtonText: t('Delete application', { count: applications.length }),
      items: applications.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (application: Application, signal) =>
        requestDelete(awxAPI`/application/${application.id.toString()}/`, signal),
    });
  };
  return deleteApplications;
}
