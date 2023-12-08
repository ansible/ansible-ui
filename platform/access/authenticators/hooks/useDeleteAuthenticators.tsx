import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { Authenticator } from '../../../interfaces/Authenticator';
import { TextCell, compareStrings, useBulkConfirmation } from '../../../../framework';
import { getItemKey, requestDelete } from '../../../../frontend/common/crud/Data';
import { useAuthenticatorsColumns } from './useAuthenticatorColumns';
import { gatewayAPI } from '../../../api/gateway-api-utils';

export function useDeleteAuthenticators(onComplete: (authenticators: Authenticator[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useAuthenticatorsColumns();
  const deleteActionNameColumn = useMemo(
    () => ({
      header: t('Name'),
      cell: (authenticator: Authenticator) => <TextCell text={authenticator.name} />,
      sort: 'name',
      maxWidth: 200,
    }),
    [t]
  );
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  // TODO: Update based on RBAC information from Authenticators API
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cannotDeleteAuthenticator = (authenticator: Authenticator) => {
    // eslint-disable-next-line no-constant-condition
    return true //authenticator?.summary_fields?.authenticator_capabilities?.delete
      ? undefined
      : t('The authentication cannot be deleted due to insufficient permissions.');
  };
  const bulkAction = useBulkConfirmation<Authenticator>();
  const deleteAuthenticators = (authenticators: Authenticator[]) => {
    const undeletableAuthenticators = authenticators.filter(cannotDeleteAuthenticator);

    bulkAction({
      title: t('Permanently delete authentications', { count: authenticators.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} authentications.', {
        count: authenticators.length - undeletableAuthenticators.length,
      }),
      actionButtonText: t('Delete authentications', { count: authenticators.length }),
      items: authenticators.sort((l, r) => compareStrings(l.name, r.name)),
      alertPrompts:
        undeletableAuthenticators.length > 0
          ? [
              t(
                '{{count}} of the selected authentications cannot be deleted due to insufficient permissions.',
                {
                  count: undeletableAuthenticators.length,
                }
              ),
            ]
          : undefined,
      isItemNonActionable: cannotDeleteAuthenticator,
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (authenticator: Authenticator, signal) =>
        requestDelete(gatewayAPI`/v1/authenticators/${authenticator.id.toString()}/`, signal),
    });
  };
  return deleteAuthenticators;
}
