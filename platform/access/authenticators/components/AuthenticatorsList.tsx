import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '../../../../framework';
import { PageTableEmptyState } from '../../../../framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '../../../../framework/components/ButtonLink';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { Authenticator } from '../../../interfaces/Authenticator';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
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
  const getPageUrl = useGetPageUrl();

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
      <PageHeader
        title={t('Authentication Methods')}
        titleHelpTitle={t('Authentication Methods')}
        titleHelp={t(
          `Set up and manage your organization's authentication methods, which are used to simplify the login experience.`
        )}
        description={t(
          "Set up and manage your organization's authentication methods, which are used to simplify the login experience."
        )}
      />
      <PageTable<Authenticator>
        id="platform-authenticators-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading authentications')}
        emptyState={
          canCreateAuthenticator ? (
            <PageTableEmptyState
              title={t('There are currently no authentications added.')}
              description={t('Please create an authentication by using the button below.')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={getPageUrl(PlatformRoute.CreateAuthenticator)}
              >
                {t('Create authentication')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={t('You do not have permission to create an authentication')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
        }
        {...view}
      />
    </PageLayout>
  );
}
