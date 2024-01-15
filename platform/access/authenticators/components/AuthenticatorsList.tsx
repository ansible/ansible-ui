import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { Authenticator } from '../../../interfaces/Authenticator';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import {
  useAuthenticatorRowActions,
  useAuthenticatorToolbarActions,
} from '../hooks/useAuthenticatorActions';
import { useAuthenticatorsColumns } from '../hooks/useAuthenticatorColumns';
import { useAuthenticatorsFilters } from '../hooks/useAuthenticatorsFilters';

export function AuthenticatorsList() {
  const { t } = useTranslation();
  const toolbarFilters = useAuthenticatorsFilters();
  const tableColumns = useAuthenticatorsColumns();
  const pageNavigate = usePageNavigate();

  const view = usePlatformView<Authenticator>({
    url: gatewayAPI`/authenticators/`,
    toolbarFilters,
    tableColumns,
  });

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(gatewayAPI`/authenticators/`);
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
        errorStateTitle={t('Error loading authentications')}
        emptyStateTitle={
          canCreateAuthenticator
            ? t('There are currently no authentications added.')
            : t('You do not have permission to create an authentication')
        }
        emptyStateDescription={
          canCreateAuthenticator
            ? t('Please create an authentication by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateAuthenticator ? undefined : CubesIcon}
        emptyStateButtonText={canCreateAuthenticator ? t('Create authentication') : undefined}
        emptyStateButtonClick={
          canCreateAuthenticator ? () => pageNavigate(PlatformRoute.CreateAuthenticator) : undefined
        }
        {...view}
      />
    </PageLayout>
  );
}
