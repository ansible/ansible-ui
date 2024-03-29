import { Label, LabelGroup } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  PageDetail,
  PageDetails,
  PageDetailsFromColumns,
  useGetPageUrl,
} from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { CredentialLabel } from '../../../common/CredentialLabel';
import { ExecutionEnvironmentDetail } from '../../../common/ExecutionEnvironmentDetail';
import { awxAPI } from '../../../common/api/awx-utils';
import { Credential } from '../../../interfaces/Credential';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { Organization } from '../../../interfaces/Organization';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useOrganizationsColumns } from '../Organizations';

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

export function OrganizationDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: organization } = useGetItem<Organization>(awxAPI`/organizations/`, params.id);
  const getPageUrl = useGetPageUrl();

  const columns = useOrganizationsColumns();
  const galaxyCredentials = useGalaxyCredentials(params.id || '0');
  const instanceGroups = useInstanceGroups(params.id || '0');

  const detailColumns = useMemo(
    () => columns.filter((col) => col.id !== 'execution-environment'),
    [columns]
  );

  if (!organization) {
    return <LoadingPage />;
  }

  // TODO look up license type from context (TBD) and add max hosts
  return (
    <PageDetails>
      <PageDetailsFromColumns columns={detailColumns} item={organization}>
        <ExecutionEnvironmentDetail
          virtualEnvironment={organization.custom_virtualenv || undefined}
          executionEnvironment={organization.summary_fields?.default_environment}
          isDefaultEnvironment
          helpText={t`The execution environment that will be used for jobs
          inside of this organization. This will be used a fallback when
          an execution environment has not been explicitly assigned at the
          project, job template or workflow level.`}
        />
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
        <PageDetail label={t('Galaxy credentials')} isEmpty={galaxyCredentials.length === 0}>
          <LabelGroup>
            {galaxyCredentials?.map((credential) => (
              <CredentialLabel credential={credential} key={credential.id} />
            ))}
          </LabelGroup>
        </PageDetail>
      </PageDetailsFromColumns>
    </PageDetails>
  );
}
