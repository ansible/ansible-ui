import { compareStrings } from '@ansible/ansible-ui-framework';
import { useNameColumn } from '@ansible/common-ui/columns';
import { getItemKey, postRequest } from '@ansible/common-ui/crud/Data';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { AwxHost } from '../../../interfaces/AwxHost';
import { useHostsColumns } from './useHostsColumns';

export function useDisassociateHosts(onComplete: (hosts: AwxHost[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useHostsColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const params = useParams<{ group_id: string }>();
  const bulkAction = useAwxBulkConfirmation<AwxHost>();
  const disassociateHost = (hosts: AwxHost[]) => {
    bulkAction({
      title: t('Disassociate host from group?'),
      confirmText: t('Yes, I confirm that I want to disassociate these {{count}} hosts.', {
        count: hosts.length,
      }),
      actionButtonText: t('Disassociate hosts', { count: hosts.length }),
      items: hosts.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (group: AwxHost, signal) =>
        postRequest(
          awxAPI`/groups/${params.group_id as string}/hosts/`,
          { disassociate: true, id: group.id },
          signal
        ),
    });
  };
  return disassociateHost;
}
