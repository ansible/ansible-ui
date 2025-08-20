import { LoadingPage, PageHeader, PageLayout, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { PlatformItemsResponse } from '@ansible/platform-ui/interfaces/PlatformItemsResponse';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  ManageResourceRoles,
  ResourceType,
} from '../../../common/access/components/ManageResourceRoles';
import { edaAPI } from '../../common/eda-utils';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { EdaRoute } from '../../main/EdaRoutes';

export function EdaRulebookActivationManageUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{
    resource_type: string;
    resource_id: string;
    user_id: string;
  }>();

  const { data: rulebookActivation } = useGet<EdaRulebookActivation>(
    edaAPI`/activations/${params.resource_id ?? ''}/`
  );
  const { data: users, isLoading } = useGet<PlatformItemsResponse<PlatformUser>>(
    gatewayAPI`/users/?resource__ansible_id=${params.user_id ?? ''}`
  );
  const user = users?.results && users.results.length > 0 ? users?.results[0] : undefined;
  if (isLoading || !rulebookActivation) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader
        title={t(
          `Manage roles directly assigned to ${user?.username ?? ''} for ${rulebookActivation?.name ?? ''}`
        )}
        breadcrumbs={[
          { label: t('RulebookActivations'), to: getPageUrl(EdaRoute.RulebookActivations) },
          {
            label: rulebookActivation?.name,
            to: getPageUrl(EdaRoute.RulebookActivationDetails, {
              params: { id: rulebookActivation?.id },
            }),
          },
          {
            label: t('User Access'),
            to: getPageUrl(EdaRoute.RulebookActivationUserAccess, {
              params: { id: rulebookActivation?.id },
            }),
          },
          { label: t(`Manage roles directly assigned to ${user?.username ?? ''}`) },
        ]}
      />
      <ManageResourceRoles resource={rulebookActivation as unknown as ResourceType} user={user} />
    </PageLayout>
  );
}
