import { useMemo } from 'react';
import { IToolbarFilter } from '../../../../../framework';
import {
  useFirstNameToolbarFilter,
  useLastNameToolbarFilter,
  useUsernameToolbarFilter,
} from '../../../common/awx-toolbar-filters';

export function useAccessListFilter() {
  const usernameToolbarFilter = useUsernameToolbarFilter();
  const firstNameToolbarFilter = useFirstNameToolbarFilter();
  const lastNameToolbarFilter = useLastNameToolbarFilter();

  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [usernameToolbarFilter, firstNameToolbarFilter, lastNameToolbarFilter],
    [usernameToolbarFilter, firstNameToolbarFilter, lastNameToolbarFilter]
  );
  return toolbarFilters;
}
