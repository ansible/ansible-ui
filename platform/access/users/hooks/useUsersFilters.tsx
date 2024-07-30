import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';

export function useUsernameToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'username',
      label: t('Username'),
      type: ToolbarFilterType.MultiText,
      query: 'username__contains',
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
      query: 'first_name__contains',
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
      query: 'last_name__contains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useEmailToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'email',
      label: t('Email'),
      type: ToolbarFilterType.MultiText,
      query: 'email__contains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useUsersFilters() {
  const usernameToolbarFilter = useUsernameToolbarFilter();
  const firstnameByToolbarFilter = useFirstNameToolbarFilter();
  const lastnameToolbarFilter = useLastNameToolbarFilter();
  const emailToolbarFilter = useEmailToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      usernameToolbarFilter,
      firstnameByToolbarFilter,
      lastnameToolbarFilter,
      emailToolbarFilter,
    ],
    [usernameToolbarFilter, firstnameByToolbarFilter, lastnameToolbarFilter, emailToolbarFilter]
  );
  return toolbarFilters;
}
