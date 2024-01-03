import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformRoute } from '../../../PlatformRoutes';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useOrganizationRowActions } from '../hooks/useOrganizationActions';

export function PlatformOrganizationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: organization,
    refresh,
  } = useGetItem<PlatformOrganization>(gatewayAPI`/v1/organizations`, params.id);
  const getPageUrl = useGetPageUrl();
  const actions = useOrganizationRowActions();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!organization) return <LoadingPage breadcrumbs tabs />;
  return (
    <PageLayout>
      <PageHeader
        title={organization.name}
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(PlatformRoute.Organizations) },
          { label: organization.name },
        ]}
        headerActions={
          <PageActions<PlatformOrganization>
            actions={actions}
            position={DropdownPosition.right}
            selectedItem={organization}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Organizations'),
          page: PlatformRoute.Organizations,
          persistentFilterKey: 'organizations',
        }}
        tabs={[{ label: t('Details'), page: PlatformRoute.OrganizationDetails }]}
        params={{ id: organization.id }}
      />
    </PageLayout>
  );
}
