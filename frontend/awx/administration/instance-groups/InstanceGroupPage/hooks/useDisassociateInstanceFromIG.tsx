import { compareStrings } from '@ansible/ansible-ui-framework';
import { getItemKey, postRequest } from '@ansible/common-ui/crud/Data';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../../common/useAwxBulkConfirmation';
import { Instance } from '../../../../interfaces/Instance';
import { useInstancesColumns } from '../../../instances/hooks/useInstancesColumns';
import { useInstanceGroupInstanceNameColumn } from './useInstanceGroupInstanceNameColumn';

export function useDisassociateInstanceFromIG(onComplete: (instances: Instance[]) => void) {
  const { t } = useTranslation();
  const bulkConfirmation = useAwxBulkConfirmation<Instance>();
  const confirmationColumns = useInstancesColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useInstanceGroupInstanceNameColumn({
    disableLinks: true,
    disableSort: true,
  });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const params = useParams<{ id: string }>();

  const disassociateInstance = (instances: Instance[]) => {
    bulkConfirmation({
      title: t('Disassociate instance from instance group'),
      confirmText: t('Yes, I confirm that I want to disassociate these {{count}} instances.', {
        count: instances.length,
      }),
      actionButtonText: t('Disassociate instances', { count: instances.length }),
      items: instances.sort((l, r) => compareStrings(l.hostname, r.hostname)),
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
