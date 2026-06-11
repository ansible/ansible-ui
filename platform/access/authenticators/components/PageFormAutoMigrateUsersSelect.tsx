import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useAuthenticatorsFilters } from '../hooks/useAuthenticatorsFilters';
import { useAuthenticatorsColumns } from '../hooks/useAuthenticatorColumns';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectAwxResource } from '@ansible/awx-ui/common/PageFormSingleSelectAwxResource';
import { PageFormMultiSelectAwxResource } from '@ansible/awx-ui/common/PageFormMultiSelectAwxResource';
import { Authenticator } from '../../../interfaces/Authenticator';

export function PageFormAutoMigrateUsersSelect(props: { readonly isLegacy: boolean }) {
  const { isLegacy = false } = props;
  const { t } = useTranslation();
  const tableFilters = useAuthenticatorsFilters();
  const tableColumns = useAuthenticatorsColumns();

  return isLegacy ? (
    <PageFormSingleSelectAwxResource
      name="auto_migrate_users_to"
      id="auto_migrate_users_to"
      url={gatewayAPI`/authenticators/`}
      label={t('Auto migrate users to')}
      placeholder={t(`Select authenticators`)}
      queryPlaceholder={t('Loading authenticators...')}
      labelHelp={t('Use this field to migrate users to a new authenticator.')}
      queryErrorText={t('Error loading authenticators')}
      tableColumns={tableColumns}
      toolbarFilters={tableFilters}
      queryParams={{ not__type__contains: 'legacy' }}
    />
  ) : (
    <PageFormMultiSelectAwxResource
      name="auto_migrate_users_to"
      id="auto_migrate_users_to"
      url={gatewayAPI`/authenticators/`}
      label={t('Auto migrate users from')}
      placeholder={t(`Select authenticators`)}
      queryPlaceholder={t('Loading authenticators...')}
      labelHelp={t(
        'Use this field to select a legacy authenticator method from which users will migrate automatically.'
      )}
      queryErrorText={t('Error loading authenticators')}
      tableColumns={tableColumns}
      compareOptionValues={(a: Authenticator, b: Authenticator) => a.id === b.id}
      toolbarFilters={tableFilters}
      queryParams={{
        type__contains: 'legacy',
      }}
    />
  );
}
