import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageTable,
  usePageNavigate,
} from '../../../../framework';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { usePersistentFilters } from '../../../../frontend/common/PersistentFilters';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import {
  useOrganizationRowActions,
  useOrganizationToolbarActions,
} from '../hooks/useOrganizationActions';
import { useOrganizationColumns } from '../hooks/useOrganizationColumns';
import { useOrganizationFilters } from '../hooks/useOrganizationFilters';
import { useGetDocsUrl } from '../../../../frontend/awx/common/util/useGetDocsUrl';

export function PlatformOrganizationList() {
  const { t } = useTranslation();
  const toolbarFilters = useOrganizationFilters();
  const tableColumns = useOrganizationColumns();
  const pageNavigate = usePageNavigate();
  usePersistentFilters('organizations');

  const view = usePlatformView<PlatformOrganization>({
    url: gatewayAPI`/organizations/`,
    toolbarFilters,
    tableColumns,
  });

  const {
    data,
    isLoading: isLoadingOptions,
    error,
  } = useOptions<OptionsResponse<ActionsResponse>>(gatewayAPI`/organizations/`);
  const canCreateOrganization = Boolean(data && data.actions && data.actions['POST']);
  const toolbarActions = useOrganizationToolbarActions(view);
  const rowActions = useOrganizationRowActions(view.unselectItemsAndRefresh);
  const docsLink = useGetDocsUrl(undefined, 'organizations');

  if (isLoadingOptions) return <LoadingPage />;
  if (error) return <AwxError error={error} />;

  return (
    <PageLayout>
      <PageHeader
        title={t('Organizations')}
        description={t('An organization is a logical collection of users, teams, and resources.')}
        titleHelpTitle={t('Organizations')}
        titleHelp={[t('An organization is a logical collection of users, teams, and resources.')]}
        titleDocLink={docsLink}
      />
      <PageTable<PlatformOrganization>
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
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={canCreateOrganization ? t('Create organization') : undefined}
        emptyStateButtonClick={
          canCreateOrganization ? () => pageNavigate(PlatformRoute.CreateOrganization) : undefined
        }
        {...view}
        defaultSubtitle={t('Organization')}
      />
    </PageLayout>
  );
}
