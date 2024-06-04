import { Label, LabelGroup } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  PageDetail,
  PageDetails,
  PageDetailsFromColumns,
  useGetPageUrl,
} from '../../../../framework';
import { CredentialLabel } from '../../../../frontend/awx/common/CredentialLabel';
import { ExecutionEnvironmentDetail } from '../../../../frontend/awx/common/ExecutionEnvironmentDetail';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Organization as AwxOrganization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxRoute } from '../../../../frontend/awx/main/AwxRoutes';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useAwxResource } from '../../../hooks/useAwxResource';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useHasAwxService } from '../../../main/GatewayServices';
import { useOrganizationColumns } from '../hooks/useOrganizationColumns';

export function PlatformOrganizationDetails() {
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const awxService = useHasAwxService();
  const columns = useOrganizationColumns();

  const { data: platformOrganization } = useGet<PlatformOrganization>(
    gatewayV1API`/organizations/${id.toString()}/`
  );

  const detailColumns = useMemo(
    () => columns.filter((col) => col.id !== 'execution-environment'),
    [columns]
  );

  return (
    <PageDetails>
      <PageDetailsFromColumns item={platformOrganization} columns={detailColumns}>
        {awxService && platformOrganization && (
          <ControllerOrganizationDetails platformOrganization={platformOrganization} />
        )}
      </PageDetailsFromColumns>
    </PageDetails>
  );
}

function ControllerOrganizationDetails(props: { platformOrganization: PlatformOrganization }) {
  const { t } = useTranslation();
  const { platformOrganization } = props;
  const getPageUrl = useGetPageUrl();

  const { resource: controllerOrganization } = useAwxResource<AwxOrganization>(
    'organizations/',
    platformOrganization
  );

  const galaxyCredentials = useGalaxyCredentials(controllerOrganization?.id.toString() || '0');
  const instanceGroups = useInstanceGroups(controllerOrganization?.id.toString() || '0');

  return (
    <>
      {controllerOrganization && instanceGroups && galaxyCredentials && (
        <>
          <ExecutionEnvironmentDetail
            virtualEnvironment={controllerOrganization.custom_virtualenv || undefined}
            executionEnvironment={controllerOrganization.summary_fields?.default_environment}
            verifyMissingVirtualEnv
            isDefaultEnvironment
            helpText={t`The execution environment that will be used for jobs
            inside of this organization. This will be used a fallback when
            an execution environment has not been explicitly assigned at the
            project, job template or workflow level.`}
          />
        </>
      )}
      {instanceGroups && (
        <PageDetail
          label={t`Instance groups`}
          helpText={t`The instance groups for this organization to run on.`}
          isEmpty={instanceGroups.length === 0}
        >
          <LabelGroup>
            {instanceGroups.map((ig) => (
              <Label color="blue" key={ig.id}>
                <Link
                  to={getPageUrl(AwxRoute.InstanceGroupDetails, {
                    params: { id: ig.id },
                  })}
                >
                  {ig.name}
                </Link>
              </Label>
            ))}
          </LabelGroup>
        </PageDetail>
      )}
      {galaxyCredentials && (
        <PageDetail label={t('Galaxy credentials')} isEmpty={galaxyCredentials.length === 0}>
          <LabelGroup>
            {galaxyCredentials.map((credential) => (
              <CredentialLabel credential={credential} key={credential.id} />
            ))}
          </LabelGroup>
        </PageDetail>
      )}
    </>
  );
}

function useGalaxyCredentials(orgId: string) {
  const { data } = useGet<{ results: Credential[] }>(
    awxAPI`/organizations/${orgId}/galaxy_credentials/`
  );
  return data?.results ?? [];
}

function useInstanceGroups(orgId: string) {
  const { data } = useGet<{ results: InstanceGroup[] }>(
    awxAPI`/organizations/${orgId}/instance_groups/`
  );
  return data?.results ?? [];
}
