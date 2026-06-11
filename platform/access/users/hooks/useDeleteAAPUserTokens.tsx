import { compareStrings, useBulkConfirmation } from '@ansible/ansible-ui-framework';
import { useUserTokensColumns } from '@ansible/awx-ui/access/users/hooks/useUserTokensColumns';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { getItemKey, requestDelete } from '@ansible/common-ui/crud/Data';
import { useTranslation } from 'react-i18next';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

export function useDeleteUserTokens(onComplete: (items: Token[]) => void) {
  const { t } = useTranslation();
  const userTokensColumns = useUserTokensColumns({ disableLinks: true, disableSort: true });
  const bulkAction = useBulkConfirmation<Token>();
  const deleteTokens = (tokens: Token[]) => {
    bulkAction({
      title: tokens.length === 1 ? t('Permanently delete token') : t('Permanently delete tokens'),
      confirmText:
        tokens.length === 1
          ? t('Yes, I confirm that I want to delete this token.')
          : t('Yes, I confirm that I want to delete these {{count}} tokens.', {
              count: tokens.length,
            }),
      actionButtonText: t('Delete token', { count: tokens.length }),
      items: tokens.sort((l, r) =>
        compareStrings(l.summary_fields.user?.username, r.summary_fields.user?.username)
      ),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns: userTokensColumns,
      actionColumns: userTokensColumns,
      onComplete,
      actionFn: (token: Token, signal) =>
        requestDelete(gatewayAPI`/tokens/${token.id.toString()}/`, signal),
    });
  };
  return deleteTokens;
}
