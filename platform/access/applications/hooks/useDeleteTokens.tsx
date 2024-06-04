import { Token } from '../../../../frontend/awx/interfaces/Token';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../framework';
import { useTokensColumns } from '../../../../frontend/awx/administration/applications/hooks/useTokensColumns';
import { useBulkConfirmation } from '../../../../framework';
import { useNameColumn } from '../../../../frontend/common/columns';
import { getItemKey, requestDelete } from '../../../../frontend/common/crud/Data';
import { gatewayV1API } from '../../../api/gateway-api-utils';

export function useDeleteTokens(onComplete: (applications: Token[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useTokensColumns({
    disableLinks: true,
    disableSort: true,
  });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useBulkConfirmation<Token>();
  const deleteTokens = (tokens: Token[]) => {
    bulkAction({
      title: tokens.length === 1 ? t('Permanently delete token') : t('Permanently delete tokens'),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} tokens.', {
        count: tokens.length,
      }),
      actionButtonText: t('Delete token', { count: tokens.length }),
      items: tokens.sort((l, r) =>
        compareStrings(l.summary_fields.user.username, r.summary_fields.user.username)
      ),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (token: Token, signal) =>
        requestDelete(gatewayV1API`/tokens/${token.id.toString()}/`, signal),
    });
  };
  return deleteTokens;
}
