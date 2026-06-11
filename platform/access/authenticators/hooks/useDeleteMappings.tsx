import { TextCell, compareStrings, useBulkConfirmation } from '@ansible/ansible-ui-framework';
import { getItemKey, requestDelete } from '@ansible/common-ui/crud/Data';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthenticatorMap } from '../../../interfaces/AuthenticatorMap';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useMappingColumns } from './useMappingColumns';

export function useDeleteMappings(onComplete: (mappings: AuthenticatorMap[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useMappingColumns({ disableLinks: true });
  const deleteActionNameColumn = useMemo(
    () => ({
      header: t('Name'),
      cell: (map: AuthenticatorMap) => <TextCell text={map.name} />,
      sort: 'name',
      maxWidth: 200,
    }),
    [t]
  );
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useBulkConfirmation<AuthenticatorMap>();
  const deleteMappings = (mappings: AuthenticatorMap[]) => {
    mappings.sort((l, r) => compareStrings(l.name, r.name));
    bulkAction({
      title: t('Permanently delete mappings', { count: mappings.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} mappings.', {
        count: mappings.length,
      }),
      actionButtonText: t('Delete mappings', { count: mappings.length }),
      items: mappings,
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (map: AuthenticatorMap, signal) =>
        requestDelete(gatewayAPI`/authenticator_maps/${map.id.toString()}/`, signal),
    });
  };
  return deleteMappings;
}
