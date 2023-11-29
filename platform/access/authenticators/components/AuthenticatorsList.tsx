import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { useAuthenticatorsFilters } from '../hooks/useAuthenticatorsFilters';
import { useAuthenticatorsColumns } from '../hooks/useAuthenticatorColumns';
import { Authenticator } from '../../../interfaces/Authenticator';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { CubesIcon } from '@patternfly/react-icons';
import { PlatformRoute } from '../../../PlatformRoutes';
import {
  useAuthenticatorRowActions,
  useAuthenticatorToolbarActions,
} from '../hooks/useAuthenticatorActions';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { gatewayAPI } from '../../../api/gateway-api-utils';

export function AuthenticatorsList() {
  const { t } = useTranslation();
  const toolbarFilters = useAuthenticatorsFilters();
  const tableColumns = useAuthenticatorsColumns();
  const pageNavigate = usePageNavigate();

  const view = usePlatformView<Authenticator>({
    url: gatewayAPI`/v1/authenticators`,
    toolbarFilters,
    tableColumns,
  });

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(gatewayAPI`/v1/authenticators`);
  const canCreateAuthenticator = Boolean(data && data.actions && data.actions['POST']);
  const toolbarActions = useAuthenticatorToolbarActions(view);
  const rowActions = useAuthenticatorRowActions(view);

  return (
    <PageLayout>
      <PageHeader title={t('Authentication')} />
      <PageTable<Authenticator>
        id="platform-authenticators-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading authentication methods')}
        emptyStateTitle={
          canCreateAuthenticator
            ? t('There are currently no authentication methods added.')
            : t('You do not have permission to create an authentication method')
        }
        emptyStateDescription={
          canCreateAuthenticator
            ? t('Please create an authentication method by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateAuthenticator ? undefined : CubesIcon}
        emptyStateButtonText={canCreateAuthenticator ? t('Create authenticator') : undefined}
        emptyStateButtonClick={
          canCreateAuthenticator ? () => pageNavigate(PlatformRoute.CreateAuthenticator) : undefined
        }
        {...view}
      />
    </PageLayout>
  );
}
