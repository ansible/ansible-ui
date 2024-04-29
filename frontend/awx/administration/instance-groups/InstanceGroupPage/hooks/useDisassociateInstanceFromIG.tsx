import { useAwxBulkConfirmation } from '../../../../common/useAwxBulkConfirmation';
import { useTranslation } from 'react-i18next';
import { Instance } from '../../../../interfaces/Instance';
import { useNameColumn } from '../../../../../common/columns';
import { getItemKey, postRequest } from '../../../../../common/crud/Data';
import { awxAPI } from '../../../../common/api/awx-utils';
import { compareStrings } from '../../../../../../framework';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useInstancesColumns } from '../../../instances/hooks/useInstancesColumns';

export function useDisassociateInstanceFromIG(onComplete: (instances: Instance[]) => void) {
  const { t } = useTranslation();
  const bulkConfirmation = useAwxBulkConfirmation<Instance>();
  const confirmationColumns = useInstancesColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const params = useParams<{ id: string }>();

  const disassociateInstance = (instances: Instance[]) => {
    bulkConfirmation({
      title: t('Disassociate instance from instance group'),
      confirmText: t('Yes, I confirm that I want to disassociate these {{count}} instances.', {
        count: instances.length,
      }),
      actionButtonText: t('Disassociate instances', { count: instances.length }),
      items: instances.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (instance: Instance, signal) =>
        postRequest(
          awxAPI`/instance_groups/${String(params.id)}/instances/`,
          { id: instance.id, disassociate: true },
          signal
        ),
    });
  };

  return disassociateInstance;
}
