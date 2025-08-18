import { LoadingPage, PageHeader, PageLayout, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { edaAPI } from '../../common/eda-utils';
import { EdaDecisionEnvironment } from '../../interfaces/EdaDecisionEnvironment';
import { EdaRoute } from '../../main/EdaRoutes';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import {
  ManageResourceRoles,
  ResourceType,
} from '@ansible/common-ui/access/components/ManageResourceRoles';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { PlatformItemsResponse } from '@ansible/platform-ui/interfaces/PlatformItemsResponse';

export function EdaDecisionEnvironmentManageUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{
    resource_type: string;
    resource_id: string;
    user_id: string;
  }>();

  const { data: decisionEnvironment } = useGet<EdaDecisionEnvironment>(
    edaAPI`/decision-environments/${params.resource_id ?? ''}/`
  );
  const { data: users, isLoading } = useGet<PlatformItemsResponse<PlatformUser>>(
    gatewayAPI`/users/?resource__ansible_id=${params.user_id ?? ''}`
  );

  const user = users?.results && users.results.length > 0 ? users?.results[0] : undefined;
  if (isLoading || !decisionEnvironment) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader
        title={t(
          `Manage roles directly assigned to ${user?.username ?? ''} for ${decisionEnvironment?.name ?? ''}`
        )}
        breadcrumbs={[
          { label: t('DecisionEnvironments'), to: getPageUrl(EdaRoute.DecisionEnvironments) },
          {
            label: decisionEnvironment?.name,
            to: getPageUrl(EdaRoute.DecisionEnvironmentDetails, {
              params: { id: decisionEnvironment?.id },
            }),
          },
          {
            label: t('User Access'),
            to: getPageUrl(EdaRoute.DecisionEnvironmentUserAccess, {
              params: { id: decisionEnvironment?.id },
            }),
          },
          { label: t(`Manage roles directly assigned to ${user?.username ?? ''}`) },
        ]}
      />
      <ManageResourceRoles resource={decisionEnvironment as unknown as ResourceType} user={user} />
    </PageLayout>
  );
}
