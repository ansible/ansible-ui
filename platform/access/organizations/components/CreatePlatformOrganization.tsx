import { useTranslation } from 'react-i18next';
import { usePatchRequest } from '../../../../frontend/common/crud/usePatchRequest';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { OrganizationWizardFormValues, PlatformOrganizationForm } from './PlatformOrganizationForm';
import { usePageAlertToaster, usePageNavigate } from '../../../../framework';
import { Organization as ControllerOrganization } from '../../../../frontend/awx/interfaces/Organization';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useAwxService } from '../../../main/GatewayServices';
import { pollAwxItemsResponseItem } from '../../../../frontend/awx/common/pollAwxItemsResponseItem';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { awxErrorAdapter } from '../../../../frontend/awx/common/adapters/awxErrorAdapter';

interface AssociateControllerInstanceGroup {
  id: number;
}

interface AssociateControllerCredential {
  id: number;
}

export function CreatePlatformOrganization() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const awxService = useAwxService();
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
            1000,
            10
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
          if (values.executionEnvironment && Object.keys(values.executionEnvironment).length > 0) {
            await updateControllerOrganizationRequest(
              awxAPI`/organizations/${controllerOrganization.id.toString()}/`,
              {
                default_environment: values.executionEnvironment.id,
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
