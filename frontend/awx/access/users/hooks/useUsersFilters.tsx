import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter } from '../../../../../framework';
import {
  useFirstNameToolbarFilter,
  useLastNameToolbarFilter,
  useUsernameToolbarFilter,
} from '../../../common/awx-toolbar-filters';

export function useUsersFilters() {
  const { t } = useTranslation();
  const usernameToolbarFilter = useUsernameToolbarFilter();
  const firstnameByToolbarFilter = useFirstNameToolbarFilter();
  const lastnameToolbarFilter = useLastNameToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      usernameToolbarFilter,
      firstnameByToolbarFilter,
      lastnameToolbarFilter,
      {
        key: 'email',
        label: t('Email'),
        type: 'string',
        query: 'email__icontains',
      },
    ],
    [usernameToolbarFilter, firstnameByToolbarFilter, lastnameToolbarFilter, t]
  );
  return toolbarFilters;
}
