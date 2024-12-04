import { ITableColumn } from '@ansible/ansible-ui-framework';
import { useExpiresColumn, useScopeColumn } from '@ansible/common-ui/columns';
import { useMemo } from 'react';
import { Token } from '../../../interfaces/Token';
import { useTokenNameColumn } from './useTokenUserColumn';

export function useTokensColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const nameColumn = useTokenNameColumn(options);
  const scopeColumn = useScopeColumn(options);
  const expiresColumn = useExpiresColumn(options);
  const tableColumns = useMemo<ITableColumn<Token>[]>(
    () => [nameColumn, scopeColumn, expiresColumn],
    [nameColumn, scopeColumn, expiresColumn]
  );
  return tableColumns;
}
