import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useUsernameToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'username',
      label: t('Username'),
      type: ToolbarFilterType.MultiText,
      query: 'username__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useFirstNameToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'firstname',
      label: t('First name'),
      type: ToolbarFilterType.MultiText,
      query: 'first_name__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useLastNameToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'lastname',
      label: t('Last name'),
      type: ToolbarFilterType.MultiText,
      query: 'last_name__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useOrganizationUsersFilters() {
  const usernameToolbarFilter = useUsernameToolbarFilter();
  const firstnameByToolbarFilter = useFirstNameToolbarFilter();
  const lastnameToolbarFilter = useLastNameToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [usernameToolbarFilter, firstnameByToolbarFilter, lastnameToolbarFilter],
    [usernameToolbarFilter, firstnameByToolbarFilter, lastnameToolbarFilter]
  );
  return toolbarFilters;
}
