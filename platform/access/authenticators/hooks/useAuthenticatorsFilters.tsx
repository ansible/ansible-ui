import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import { AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';

export function useNameToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'name',
      label: t('Name'),
      type: ToolbarFilterType.MultiText,
      query: 'name__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useTypeToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'type',
      label: t('Authentication type'),
      type: ToolbarFilterType.MultiSelect,
      query: 'or__type',
      options: [
        { label: t('LDAP'), value: AuthenticatorTypeEnum.LDAP },
        { label: t('Local'), value: AuthenticatorTypeEnum.Local },
        { label: t('Keycloak'), value: AuthenticatorTypeEnum.Keycloak },
        { label: t('SAML'), value: AuthenticatorTypeEnum.SAML },
      ],
      placeholder: t('Select types'),
    }),
    [t]
  );
}

export function useAuthenticatorsFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const typeToolbarFilter = useTypeToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [nameToolbarFilter, typeToolbarFilter],
    [nameToolbarFilter, typeToolbarFilter]
  );
  return toolbarFilters;
}
