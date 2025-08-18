import { LoadingPage, PageHeader, PageLayout, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { EdaRoute } from '../../../main/EdaRoutes';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import {
  ManageResourceRoles,
  ResourceType,
} from '@ansible/common-ui/access/components/ManageResourceRoles';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { PlatformItemsResponse } from '@ansible/platform-ui/interfaces/PlatformItemsResponse';

export function EdaCredentialManageUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{
    resource_type: string;
    resource_id: string;
    user_id: string;
  }>();

  const { data: credential } = useGet<EdaCredential>(
    edaAPI`/eda-credentials/${params.resource_id ?? ''}/`
  );
  const { data: users, isLoading } = useGet<PlatformItemsResponse<PlatformUser>>(
    gatewayAPI`/users/?resource__ansible_id=${params.user_id ?? ''}`
  );
  const user = users?.results && users.results.length > 0 ? users?.results[0] : undefined;
  if (isLoading || !credential) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader
        title={t(
          `Manage roles directly assigned to ${user?.username ?? ''} for ${credential?.name ?? ''}`
        )}
        breadcrumbs={[
          { label: t('Credentials'), to: getPageUrl(EdaRoute.Credentials) },
          {
            label: credential?.name,
            to: getPageUrl(EdaRoute.CredentialDetails, { params: { id: credential?.id } }),
          },
          {
            label: t('User Access'),
            to: getPageUrl(EdaRoute.CredentialUserAccess, { params: { id: credential?.id } }),
          },
          { label: t(`Manage roles directly assigned to ${user?.username ?? ''}`) },
        ]}
      />
      <ManageResourceRoles resource={credential as unknown as ResourceType} user={user} />
    </PageLayout>
  );
}
