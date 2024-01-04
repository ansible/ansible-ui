import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, postRequest } from '../../../../common/crud/Data';
import { awxAPI } from '../../../api/awx-utils';
import { Instance } from '../../../interfaces/Instance';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { useInstancesColumns } from './useInstancesColumns';

export function useRunHealthCheck(onComplete: (instances: Instance[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useInstancesColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<Instance>();
  const cannotRunHealthCheckDueToNodeType = (instance: Instance) => {
    if (instance.node_type !== 'execution')
      return t(`Health checks can only be run on execution instances.`);
    return '';
  };

  const runHealthCheckOnInstances = (instances: Instance[]) => {
    const nonHealthCheckableInstances: Instance[] = instances.filter(
      cannotRunHealthCheckDueToNodeType
    );

    bulkAction({
      title: t('Run health checks on these instances', { count: instances.length }),
      confirmText: t(
        'Yes, I confirm that I want to run health checks on these {{count}} instances.',
        {
          count: instances.length - nonHealthCheckableInstances.length,
        }
      ),
      actionButtonText: t('Run health check', { count: instances.length }),
      items: instances.sort((l, r) => compareStrings(l.hostname, r.hostname)),
      alertPrompts: nonHealthCheckableInstances.length
        ? [
            ...(nonHealthCheckableInstances.length
              ? [
                  t(
                    'Cannot run health checks on {{count}} of the selected instances.  Health checks can only be run on execution instances.',
                    {
                      count: nonHealthCheckableInstances.length,
                    }
                  ),
                ]
              : []),
          ]
        : undefined,
      isItemNonActionable: (instance: Instance) => cannotRunHealthCheckDueToNodeType(instance),

      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: async (instance: Instance) =>
        postRequest(awxAPI`/instances/${instance.id.toString()}/health_check`, {}),
    });
  };
  return runHealthCheckOnInstances;
}
