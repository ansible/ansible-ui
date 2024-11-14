import { LoadingPage, usePageAlertToaster, usePageNavigate } from '@ansible/ansible-ui-framework';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { awxErrorAdapter } from '@ansible/awx-ui/common/adapters/awxErrorAdapter';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { Credential } from '@ansible/awx-ui/interfaces/Credential';
import { InstanceGroup as ControllerInstanceGroup } from '@ansible/awx-ui/interfaces/InstanceGroup';
import { Organization as ControllerOrganization } from '@ansible/awx-ui/interfaces/Organization';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { requestGet } from '../../../../frontend/common/crud/Data';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { usePatchRequest } from '../../../../frontend/common/crud/usePatchRequest';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
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

interface DisassociateControllerInstanceGroup {
  id: number;
  disassociate: boolean;
}

interface DisassociateControllerCredential {
  id: number;
  disassociate: boolean;
}

function areArraysEqualInOrder<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

export function EditPlatformOrganization() {
  const pageNavigate = usePageNavigate();
  const alertToaster = usePageAlertToaster();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const awxService = useHasAwxService();

  const { data: platformOrganization } = useGet<PlatformOrganization>(
    gatewayAPI`/organizations/${id.toString()}/`
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
    const currentInstanceGroups = values.instanceGroups || [];
    const previousInstanceGroups = instanceGroups || [];
    const currentGalaxyCredentials = values.galaxyCredentials || [];
    const previousGalaxyCredentials = galaxyCredentials || [];

    const currentInstanceGroupsIds = currentInstanceGroups.map((ig) => ig.id);
    const previousInstanceGroupsIds = previousInstanceGroups.map((ig) => ig.id);
    const currentGalaxyCredentialsIds = currentGalaxyCredentials.map((cred) => cred.id);
    const previousGalaxyCredentialsIds = previousGalaxyCredentials.map((cred) => cred.id);

    const instanceGroupsChanged = !areArraysEqualInOrder<number>(
      currentInstanceGroupsIds,
      previousInstanceGroupsIds
    );

    const galaxyCredentialsChanged = !areArraysEqualInOrder<number>(
      currentGalaxyCredentialsIds,
      previousGalaxyCredentialsIds
    );

    try {
      await patchRequest(gatewayAPI`/organizations/${id.toString()}/`, values.organization);

      if (awxService && controllerOrganization) {
        await updateControllerOrganizationRequest(
          awxAPI`/organizations/${controllerOrganization.id.toString()}/`,
          {
            default_environment: values?.executionEnvironment ?? null,
            max_hosts: values?.maxHosts ? values?.maxHosts : 0,
          }
        );

        // Resolve promises for instance groups and galaxy credentials in order to
        // avoid race conditions and ensure order of operations

        if (instanceGroupsChanged) {
          // Disassociate all instance groups before associating new ones
          for (const previousIg of previousInstanceGroups) {
            await disassociateInstanceGroupsRequest(
              awxAPI`/organizations/${controllerOrganization.id.toString()}/instance_groups/`,
              {
                id: previousIg.id,
                disassociate: true,
              }
            );
          }

          for (const newIg of currentInstanceGroups) {
            await associateInstanceGroupsRequest(
              awxAPI`/organizations/${controllerOrganization.id.toString()}/instance_groups/`,
              {
                id: newIg.id,
              }
            );
          }
        }

        if (galaxyCredentialsChanged) {
          // Disassociate all galaxy credentials before associating new ones
          for (const previousGalaxyCred of previousGalaxyCredentials) {
            await disassociateGalaxyCredentialsRequest(
              awxAPI`/organizations/${controllerOrganization.id.toString()}/galaxy_credentials/`,
              {
                id: previousGalaxyCred.id,
                disassociate: true,
              }
            );
          }

          for (const newGalaxyCred of currentGalaxyCredentials) {
            await associateGalaxyCredentialsRequest(
              awxAPI`/organizations/${controllerOrganization.id.toString()}/galaxy_credentials/`,
              {
                id: newGalaxyCred.id,
              }
            );
          }
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
