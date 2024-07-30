import { useTranslation } from 'react-i18next';
import { usePageAlertToaster, usePageNavigate } from '../../../../framework';
import { awxErrorAdapter } from '../../../../frontend/awx/common/adapters/awxErrorAdapter';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { pollAwxItemsResponseItem } from '../../../../frontend/awx/common/pollAwxItemsResponseItem';
import { Organization as ControllerOrganization } from '../../../../frontend/awx/interfaces/Organization';
import { usePatchRequest } from '../../../../frontend/common/crud/usePatchRequest';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useHasAwxService } from '../../../main/GatewayServices';
import { PlatformRoute } from '../../../main/PlatformRoutes';
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
  const alertToaster = usePageAlertToaster();
  const createOrganizationRequest = usePostRequest<PlatformOrganization>();
  const updateControllerOrganizationRequest = usePatchRequest();
  const associateInstanceGroupsRequest = usePostRequest<AssociateControllerInstanceGroup>();
  const associateGalaxyCredential = usePostRequest<AssociateControllerCredential>();

  const handleSubmit = async (values: OrganizationWizardFormValues) => {
    try {
      const createdOrganization = await createOrganizationRequest(
        gatewayV1API`/organizations/`,
        values.organization
      );
      // Wait for the organization to be present in Controller before associating instance groups
      if (!createdOrganization.summary_fields?.resource?.ansible_id) {
        throw new Error(t('Organization resource ansible_id is not available'));
      } else {
        if (awxService) {
          const controllerOrganization = await pollAwxItemsResponseItem<ControllerOrganization>(
            awxAPI`/organizations/?resource__ansible_id=${createdOrganization.summary_fields.resource.ansible_id}`,
            10,
            1000
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
    } catch (error) {
      const { genericErrors, fieldErrors } = awxErrorAdapter(error);
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to create organization.'),
        children: (
          <>
            {genericErrors?.map((err) => err.message)}
            {fieldErrors?.map((err) => err.message)}
          </>
        ),
      });
    }
  };

  return <PlatformOrganizationForm handleSubmit={handleSubmit} />;
}
