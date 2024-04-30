import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Token } from '../../../interfaces/Token';
import { useUserTokensColumns } from './useUserTokensColumns';
import { AwxUser } from '../../../interfaces/User';

export function useDeleteUserTokens(user: AwxUser, onComplete: (items: Token[]) => void) {
  const { t } = useTranslation();
  const userTokensColumns = useUserTokensColumns(user, { disableLinks: true, disableSort: true });
  const bulkAction = useAwxBulkConfirmation<Token>();
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
        compareStrings(l.summary_fields.user.username, r.summary_fields.user.username)
      ),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns: userTokensColumns,
      actionColumns: userTokensColumns,
      onComplete,
      actionFn: (token: Token, signal) =>
        requestDelete(awxAPI`/tokens/${token.id.toString()}/`, signal),
    });
  };
  return deleteTokens;
}
