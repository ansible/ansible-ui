import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { useOrganizationFilters } from '../hooks/useOrganizationFilters';
import { useOrganizationColumns } from '../hooks/useOrganizationColumns';
import { Organization } from '../../../interfaces/Organization';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { CubesIcon } from '@patternfly/react-icons';
import { PlatformRoute } from '../../../PlatformRoutes';
import {
  useOrganizationRowActions,
  useOrganizationToolbarActions,
} from '../hooks/useOrganizationActions';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { gatewayAPI } from '../../../api/gateway-api-utils';

export function OrganizationList() {
  const { t } = useTranslation();
  const toolbarFilters = useOrganizationFilters();
  const tableColumns = useOrganizationColumns();
  const pageNavigate = usePageNavigate();

  const view = usePlatformView<Organization>({
    url: gatewayAPI`/v1/organizations`,
    toolbarFilters,
    tableColumns,
  });

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(gatewayAPI`/v1/organizations`);
  const canCreateOrganization = Boolean(data && data.actions && data.actions['POST']);
  const toolbarActions = useOrganizationToolbarActions(view);
  const rowActions = useOrganizationRowActions(view);

  return (
    <PageLayout>
      <PageHeader title={t('Organizations')} />
      <PageTable<Organization>
        id="platform-organizations-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading organizations')}
        emptyStateTitle={
          canCreateOrganization
            ? t('There are currently no organizations added.')
            : t('You do not have permission to create an organization')
        }
        emptyStateDescription={
          canCreateOrganization
            ? t('Please create an organization by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateOrganization ? undefined : CubesIcon}
        emptyStateButtonText={canCreateOrganization ? t('Create organization') : undefined}
        emptyStateButtonClick={
          canCreateOrganization ? () => pageNavigate(PlatformRoute.CreateOrganization) : undefined
        }
        {...view}
      />
    </PageLayout>
  );
}
