import { usePageNavigate } from '@ansible/ansible-ui-framework';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { pollAwxItemsResponseItem } from '@ansible/awx-ui/common/pollAwxItemsResponseItem';
import { Organization as ControllerOrganization } from '@ansible/awx-ui/interfaces/Organization';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useTranslation } from 'react-i18next';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useHasAwxService } from '../../../main/GatewayServices';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { OrganizationWizardFormValues, PlatformOrganizationForm } from './PlatformOrganizationForm';

interface AssociateControllerInstanceGroup {
  id: number;
}

interface AssociateControllerCredential {
  id: number;
}

export function CreatePlatformOrganization() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const awxService = useHasAwxService();
  const createOrganizationRequest = usePostRequest<PlatformOrganization>();
  const updateControllerOrganizationRequest = usePatchRequest();
  const associateInstanceGroupsRequest = usePostRequest<AssociateControllerInstanceGroup>();
  const associateGalaxyCredential = usePostRequest<AssociateControllerCredential>();

  const handleSubmit = async (values: OrganizationWizardFormValues) => {
    const createdOrganization = await createOrganizationRequest(
      gatewayAPI`/organizations/`,
      values.organization
    );
    const updateControllerOrg: boolean =
      (Array.isArray(values.instanceGroups) && values.instanceGroups.length > 0) ||
      (Array.isArray(values.galaxyCredentials) && values.galaxyCredentials.length > 0) ||
      values.executionEnvironment !== undefined;
    // Wait for the organization to be present in Controller before associating instance groups
    if (!createdOrganization.summary_fields?.resource?.ansible_id) {
      throw new Error(t('Organization resource ansible_id is not available'));
    } else {
      if (
        // only perform Controller org updates if specified
        awxService &&
        updateControllerOrg
      ) {
        // increase polling to once every 2 seconds try and reduce sync mismatch, see AAP-29629 and AAP-27171
        const controllerOrganization = await pollAwxItemsResponseItem<ControllerOrganization>(
          awxAPI`/organizations/?resource__ansible_id=${createdOrganization.summary_fields.resource.ansible_id}`,
          10,
          2000
        );
        for (const ig of values.instanceGroups || []) {
          await associateInstanceGroupsRequest(
            awxAPI`/organizations/${controllerOrganization.id.toString()}/instance_groups/`,
            {
              id: ig.id,
            }
          );
        }
        for (const cred of values.galaxyCredentials || []) {
          await associateGalaxyCredential(
            awxAPI`/organizations/${controllerOrganization.id.toString()}/galaxy_credentials/`,
            {
              id: cred.id,
            }
          );
        }
        if (values.executionEnvironment) {
          await updateControllerOrganizationRequest(
            awxAPI`/organizations/${controllerOrganization.id.toString()}/`,
            {
              default_environment: values.executionEnvironment,
              max_hosts: values?.maxHosts ?? 0,
            }
          );
        }
      }
      pageNavigate(PlatformRoute.OrganizationDetails, { params: { id: createdOrganization.id } });
    }
  };

  return <PlatformOrganizationForm handleSubmit={handleSubmit} />;
}
