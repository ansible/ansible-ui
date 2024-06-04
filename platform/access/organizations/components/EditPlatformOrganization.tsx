import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { LoadingPage, usePageAlertToaster, usePageNavigate } from '../../../../framework';
import { AwxItemsResponse } from '../../../../frontend/awx/common/AwxItemsResponse';
import { awxErrorAdapter } from '../../../../frontend/awx/common/adapters/awxErrorAdapter';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { InstanceGroup as ControllerInstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Organization as ControllerOrganization } from '../../../../frontend/awx/interfaces/Organization';
import { requestGet, swrOptions } from '../../../../frontend/common/crud/Data';
import { usePatchRequest } from '../../../../frontend/common/crud/usePatchRequest';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { gatewayAPI, gatewayV1API } from '../../../api/gateway-api-utils';
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

interface DisassociateControllerInstanceGroup {
  id: number;
  disassociate: boolean;
}

interface DisassociateControllerCredential {
  id: number;
  disassociate: boolean;
}

export function EditPlatformOrganization() {
  const pageNavigate = usePageNavigate();
  const alertToaster = usePageAlertToaster();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const awxService = useHasAwxService();

  const { data: platformOrganization } = useSWR<PlatformOrganization>(
    gatewayAPI`/organizations/${id.toString()}/`,
    requestGet,
    swrOptions
  );

  const [controllerOrganization, setControllerOrganization] = useState<
    ControllerOrganization | undefined
  >();
  const [galaxyCredentials, setGalaxyCredentials] = useState<Credential[] | undefined>();
  const [instanceGroups, setInstanceGroups] = useState<ControllerInstanceGroup[] | undefined>();

  useEffect(() => {
    async function fetchControllerOrganizationFields() {
      const controllerOrganizations = await requestGet<AwxItemsResponse<ControllerOrganization>>(
        awxAPI`/organizations/?resource__ansible_id=${platformOrganization?.summary_fields.resource?.ansible_id || ''}`
      );
      setControllerOrganization(controllerOrganizations.results[0]);
      if (controllerOrganizations.count === 1) {
        const controllerGalaxyCredentials = await requestGet<{ results: Credential[] }>(
          awxAPI`/organizations/${controllerOrganizations.results[0].id.toString()}/galaxy_credentials/`
        );
        setGalaxyCredentials(controllerGalaxyCredentials.results);
        const controllerInstanceGroups = await requestGet<{ results: ControllerInstanceGroup[] }>(
          awxAPI`/organizations/${controllerOrganizations.results[0].id.toString()}/instance_groups/`
        );
        setInstanceGroups(controllerInstanceGroups.results);
      }
    }

    if (awxService && platformOrganization) {
      void fetchControllerOrganizationFields();
    }
  }, [platformOrganization, awxService]);

  const patchRequest = usePatchRequest<PlatformOrganization, PlatformOrganization>();

  const updateControllerOrganizationRequest = usePatchRequest();
  const associateInstanceGroupsRequest = usePostRequest<AssociateControllerInstanceGroup>();
  const disassociateInstanceGroupsRequest = usePostRequest<DisassociateControllerInstanceGroup>();
  const associateGalaxyCredentialsRequest = usePostRequest<AssociateControllerCredential>();
  const disassociateGalaxyCredentialsRequest = usePostRequest<DisassociateControllerCredential>();

  const handleSubmit = async (values: OrganizationWizardFormValues) => {
    try {
      await patchRequest(gatewayV1API`/organizations/${id.toString()}/`, values.organization);

      if (awxService && controllerOrganization) {
        const disassociateAndUpdateRequests = [];
        disassociateAndUpdateRequests.push(
          updateControllerOrganizationRequest(
            awxAPI`/organizations/${controllerOrganization.id.toString()}/`,
            {
              default_environment: values?.executionEnvironment?.name
                ? values?.executionEnvironment?.id
                : null,
            }
          )
        );
        for (const previousIg of instanceGroups || []) {
          disassociateAndUpdateRequests.push(
            disassociateInstanceGroupsRequest(
              awxAPI`/organizations/${controllerOrganization.id.toString()}/instance_groups/`,
              {
                id: previousIg.id,
                disassociate: true,
              }
            )
          );
        }
        for (const previousGalaxyCred of galaxyCredentials || []) {
          disassociateAndUpdateRequests.push(
            disassociateGalaxyCredentialsRequest(
              awxAPI`/organizations/${controllerOrganization.id.toString()}/galaxy_credentials/`,
              {
                id: previousGalaxyCred.id,
                disassociate: true,
              }
            )
          );
        }

        await Promise.all(disassociateAndUpdateRequests);

        for (const newIg of values.instanceGroups || []) {
          await associateInstanceGroupsRequest(
            awxAPI`/organizations/${controllerOrganization.id.toString()}/instance_groups/`,
            {
              id: newIg.id,
            }
          );
        }
        for (const newGalaxyCred of values.galaxyCredentials || []) {
          await associateGalaxyCredentialsRequest(
            awxAPI`/organizations/${controllerOrganization.id.toString()}/galaxy_credentials/`,
            {
              id: newGalaxyCred.id,
            }
          );
        }
      }
      pageNavigate(PlatformRoute.OrganizationDetails, { params: { id } });
    } catch (error) {
      const { genericErrors, fieldErrors } = awxErrorAdapter(error);
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to update organization.'),
        children: (
          <>
            {genericErrors?.map((err) => err.message)}
            {fieldErrors?.map((err) => err.message)}
          </>
        ),
      });
    }
  };

  if (
    !platformOrganization ||
    (awxService && (!controllerOrganization || !galaxyCredentials || !instanceGroups))
  ) {
    return <LoadingPage />;
  }

  return (
    <PlatformOrganizationForm
      organization={platformOrganization}
      controllerOrganization={controllerOrganization}
      instanceGroups={instanceGroups}
      galaxyCredentials={galaxyCredentials}
      handleSubmit={handleSubmit}
    />
  );
}
