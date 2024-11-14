import { compareStrings } from '@ansible/ansible-ui-framework';
import { useNameColumn } from '@ansible/common-ui/columns';
import { getItemKey, postRequest } from '@ansible/common-ui/crud/Data';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useAwxBulkActionDialog } from '../../../../common/useAwxBulkActionDialog';
import { Instance } from '../../../../interfaces/Instance';

export function useAssociateInstanceToIG(
  onComplete: (instances: Instance[]) => void,
  instanceGroupId: string
) {
  const { t } = useTranslation();
  const addActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [addActionNameColumn], [addActionNameColumn]);
  const bulkAction = useAwxBulkActionDialog<Instance>();
  const associateInstanceToIG = (instances: Instance[]) => {
    bulkAction({
      title: t('Associate instance to instance groups', { count: instances.length }),
      items: instances.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      actionColumns,
      onComplete,
      actionFn: async (instance: Instance, signal: AbortSignal) => {
        await postRequest(
          awxAPI`/instance_groups/${instanceGroupId}/instances/`,
          {
            id: instance.id,
          },
          signal
        );
      },
      processingText: t('Adding host to group', { count: instances.length }),
    });
  };
  return associateInstanceToIG;
}
