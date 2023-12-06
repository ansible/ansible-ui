import { useCallback, useMemo } from 'react';
import { usePageNavigate, ITableColumn } from '../../../../../framework';
import { useNameColumn, useScopeColumn, useExpiresColumn } from '../../../../common/columns';
import { AwxRoute } from '../../../AwxRoutes';
import { Token } from '../../../interfaces/Token';

export function useTokensColumns() {
  const pageNavigate = usePageNavigate();

  const nameClick = useCallback(
    (token: Token) => pageNavigate(AwxRoute.UserDetails, { params: { id: token.user } }),
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    onClick: nameClick,
    sort: 'user__username',
  });
  const scopeColumn = useScopeColumn();
  const expiresColumn = useExpiresColumn();

  const tableColumns = useMemo<ITableColumn<Token>[]>(
    () => [nameColumn, scopeColumn, expiresColumn],
    [nameColumn, scopeColumn, expiresColumn]
  );
  return tableColumns;
}
