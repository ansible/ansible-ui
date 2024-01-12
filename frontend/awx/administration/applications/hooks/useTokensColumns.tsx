import { useCallback, useMemo } from 'react';
import { ITableColumn, usePageNavigate } from '../../../../../framework';
import { useExpiresColumn, useNameColumn, useScopeColumn } from '../../../../common/columns';
import { Token } from '../../../interfaces/Token';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useTokensColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const pageNavigate = usePageNavigate();

  const nameClick = useCallback(
    (token: Token) => pageNavigate(AwxRoute.UserDetails, { params: { id: token.user } }),
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    onClick: nameClick,
    sort: 'user__username',
    ...options,
  });
  const scopeColumn = useScopeColumn(options);
  const expiresColumn = useExpiresColumn(options);

  const tableColumns = useMemo<ITableColumn<Token>[]>(
    () => [nameColumn, scopeColumn, expiresColumn],
    [nameColumn, scopeColumn, expiresColumn]
  );
  return tableColumns;
}
