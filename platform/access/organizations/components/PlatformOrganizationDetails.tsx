import {
  LoadingPage,
  PageDetail,
  PageDetails,
  PageDetailsFromColumns,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { CredentialLabel } from '@ansible/awx-ui/common/CredentialLabel';
import { ExecutionEnvironmentDetail } from '@ansible/awx-ui/common/ExecutionEnvironmentDetail';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { useAwxConfig } from '@ansible/awx-ui/common/useAwxConfig';
import { Credential } from '@ansible/awx-ui/interfaces/Credential';
import { InstanceGroup } from '@ansible/awx-ui/interfaces/InstanceGroup';
import { Organization as AwxOrganization } from '@ansible/awx-ui/interfaces/Organization';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { Label, LabelGroup } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useAwxResource } from '../../../hooks/useAwxResource';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useHasAwxService } from '../../../main/GatewayServices';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useOrganizationColumns } from '../hooks/useOrganizationColumns';
import { useFeatureFlag } from '@ansible/awx-ui/common/useFeatureFlags';

export function PlatformOrganizationDetails() {
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const awxService = useHasAwxService();
  const columns = useOrganizationColumns({ disableLinks: true });

  const { data: platformOrganization, isLoading } = useGet<PlatformOrganization>(
    gatewayAPI`/organizations/${id.toString()}/`
  );

  const detailColumns = useMemo(
    () => columns.filter((col) => col.id !== 'execution-environment'),
    [columns]
  );

  if (isLoading) return <LoadingPage />;

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
  const config = useAwxConfig();
  const hasPolicyAsCodeFlag = useFeatureFlag('FEATURE_POLICY_AS_CODE_ENABLED');

  const { resource: controllerOrganization, isLoading } = useAwxResource<AwxOrganization>(
    'organizations/',
    platformOrganization
  );

  const galaxyCredentials = useGalaxyCredentials(controllerOrganization?.id.toString() || '0');
  const instanceGroups = useInstanceGroups(controllerOrganization?.id.toString() || '0');

  if (isLoading) return <LoadingPage />;

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
      {config && config?.license_info.license_type !== 'open' && (
        <PageDetail
          label={t('Max hosts')}
          isEmpty={controllerOrganization?.max_hosts === undefined}
        >
          {controllerOrganization?.max_hosts}
        </PageDetail>
      )}
      {hasPolicyAsCodeFlag && (
        <PageDetail
          label={t('OPA query path')}
          isEmpty={controllerOrganization?.opa_query_path === null}
          helpText={
            <Trans>
              <p>The query path for the OPA policy to evaluate prior to job execution.</p>
              <br />
              <p>
                The query path should be formatted as {`{`}package{'}'}/{'{'}rule{'}'}`.
              </p>
            </Trans>
          }
        >
          {controllerOrganization?.opa_query_path}
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
