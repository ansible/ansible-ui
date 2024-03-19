import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import { usePlatformOrganizationsFilter } from '../../organizations/hooks/usePlatformOrganizationsFilter';

export function useUsernameToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'username',
      label: t('Username'),
      type: ToolbarFilterType.SingleText,
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
      type: ToolbarFilterType.SingleText,
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
      type: ToolbarFilterType.SingleText,
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
      type: ToolbarFilterType.SingleText,
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
  const organizationsFilter = usePlatformOrganizationsFilter('organizations');
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      usernameToolbarFilter,
      firstnameByToolbarFilter,
      lastnameToolbarFilter,
      emailToolbarFilter,
      organizationsFilter,
    ],
    [
      usernameToolbarFilter,
      firstnameByToolbarFilter,
      lastnameToolbarFilter,
      emailToolbarFilter,
      organizationsFilter,
    ]
  );
  return toolbarFilters;
}
