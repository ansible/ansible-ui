import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestPatch } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Instance } from '../../../interfaces/Instance';
import { useInstancesColumns } from './useInstancesColumns';

export function useRemoveInstances(onComplete: (instances: Instance[]) => void) {
  const tableColumns = useInstancesColumns({ disableLinks: true });
  const confirmationColumns = useMemo(
    () => tableColumns.filter((item) => ['Name', 'Node type'].includes(item.header)),
    [tableColumns]
  );

  const { t } = useTranslation();
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<Instance>();
  const removeInstances = (instances: Instance[]) => {
    bulkAction({
      title: t('Permanently remove instances', { count: instances.length }),
      confirmText:
        instances.length === 1
          ? t('Yes, I confirm that I want to delete this instance.')
          : t('Yes, I confirm that I want to delete these {{count}} instances.', {
              count: instances.length,
            }),
      actionButtonText: t('Remove instance', { count: instances.length }),
      items: instances.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (instances: Instance) =>
        requestPatch(awxAPI`/instances/${instances.id.toString()}/`, {
          node_state: 'deprovisioning',
        }),
    });
  };
  return removeInstances;
}
