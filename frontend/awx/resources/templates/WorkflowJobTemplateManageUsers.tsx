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
import { awxAPI } from '../../common/api/awx-utils';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../main/AwxRoutes';

export function WorkflowJobTemplateManageUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{
    resource_type: string;
    resource_id: string;
    user_id: string;
  }>();

  const { data: jobTemplate } = useGet<WorkflowJobTemplate>(
    awxAPI`/workflow_job_templates/${params.resource_id ?? ''}/`
  );
  const { data: users, isLoading } = useGet<PlatformItemsResponse<PlatformUser>>(
    gatewayAPI`/users/?resource__ansible_id=${params.user_id ?? ''}`
  );

  const user = users?.results && users.results.length > 0 ? users?.results[0] : undefined;
  if (isLoading || !jobTemplate) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader
        title={t(
          `Manage roles directly assigned to ${user?.username ?? ''} for ${jobTemplate?.name ?? ''}`
        )}
        breadcrumbs={[
          { label: t('WorkflowJobTemplates'), to: getPageUrl(AwxRoute.Templates) },
          {
            label: jobTemplate?.name,
            to: getPageUrl(AwxRoute.WorkflowJobTemplateDetails, {
              params: { id: jobTemplate?.id },
            }),
          },
          {
            label: t('User Access'),
            to: getPageUrl(AwxRoute.WorkflowJobTemplateUserAccess, {
              params: { id: jobTemplate?.id },
            }),
          },
          { label: t(`Manage roles directly assigned to ${user?.username ?? ''}`) },
        ]}
      />
      <ManageResourceRoles resource={jobTemplate as unknown as ResourceType} user={user} />
    </PageLayout>
  );
}
