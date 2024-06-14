import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { getAuthenticatorTypeLabel } from '../getAuthenticatorTypeLabel';
import { AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
import { AuthenticatorPlugins } from '../../../interfaces/AuthenticatorPlugin';

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
  const { data: plugins, isLoading } = useGet<AuthenticatorPlugins>(
    gatewayAPI`/authenticator_plugins/`
  );
  return useMemo<IToolbarFilter>(() => {
    let options = [
      { label: t('LDAP'), value: AuthenticatorTypeEnum.LDAP },
      { label: t('Local'), value: AuthenticatorTypeEnum.Local },
      { label: t('Keycloak'), value: AuthenticatorTypeEnum.Keycloak },
      { label: t('SAML'), value: AuthenticatorTypeEnum.SAML },
    ];
    if (plugins?.authenticators && !isLoading) {
      options = plugins.authenticators.map((plugin) => ({
        label: getAuthenticatorTypeLabel(plugin.type, t),
        value: plugin.type,
      }));
    }
    return {
      key: 'type',
      label: t('Authentication type'),
      type: ToolbarFilterType.MultiSelect,
      query: 'type',
      options,
      placeholder: t('Select types'),
    };
  }, [t, plugins, isLoading]);
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
