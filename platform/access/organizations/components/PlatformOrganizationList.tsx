import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageTable,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { useGetDocsUrl } from '@ansible/awx-ui/common/util/useGetDocsUrl';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
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

export function PlatformOrganizationList() {
  const { t } = useTranslation();
  const toolbarFilters = useOrganizationFilters();
  const tableColumns = useOrganizationColumns();
  const getPageUrl = useGetPageUrl();
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
        emptyState={
          canCreateOrganization ? (
            <PageTableEmptyState
              title={t('No organizations found')}
              description={t('There are currently no organizations added.')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={getPageUrl(PlatformRoute.CreateOrganization)}
              >
                {t('Create organization')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={t('You do not have permission to create an organization')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
        }
        defaultSubtitle={t('Organization')}
        {...view}
      />
    </PageLayout>
  );
}
