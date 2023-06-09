import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { requestDelete } from '../../../common/crud/Data';
import { nameKeyFn } from '../../usePulpView';
import { HubNamespace } from '../HubNamespace';
import { useHubNamespacesColumns } from './useHubNamespacesColumns';

export function useDeleteHubNamespaces(onComplete: (namespaces: HubNamespace[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useHubNamespacesColumns({ disableLinks: true, disableSort: true });
  const bulkAction = useBulkConfirmation<HubNamespace>();

  const deleteHubNamespaces = (namespaces: HubNamespace[]) => {
    bulkAction({
      title: t('Permanently delete namespaces', { count: namespaces.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} namespaces.', {
        count: namespaces.length,
      }),
      actionButtonText: t('Delete namespaces', { count: namespaces.length }),
      items: namespaces.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: nameKeyFn,
      isDanger: true,
      confirmationColumns,
      actionColumns: confirmationColumns,
      onComplete,
      alertPrompts: [t('Deleting a namespace will delete all collections in the namespace.')],
      actionFn: (namespace: HubNamespace) =>
        requestDelete(`/api/automation-hub/_ui/v1/namespaces/${namespace.name}/`),
    });
  };
  return deleteHubNamespaces;
}
