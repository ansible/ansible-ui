import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Token } from '../../../interfaces/Token';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function useTokenNameColumn(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const column = useMemo<ITableColumn<Token>>(
    () => ({
      header: t('Hostname'),
      type: 'text',
      value: (token) => token.summary_fields.user.username,
      to: (item: Token) => getPageUrl(PlatformRoute.UserDetails, { params: { id: item.user } }),
      sort: 'user__username',
      card: 'name',
      list: 'name',
      defaultSortDirection: 'asc',
      defaultSort: true,
    }),
    [getPageUrl, t]
  );
  return column;
}
