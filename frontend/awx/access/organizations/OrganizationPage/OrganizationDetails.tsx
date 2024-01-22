import { Label, LabelGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  DateTimeCell,
  PageDetail,
  PageDetails,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { CredentialLabel } from '../../../common/CredentialLabel';
import { ExecutionEnvironmentDetail } from '../../../common/ExecutionEnvironmentDetail';
import { awxAPI } from '../../../common/api/awx-utils';
import { Credential } from '../../../interfaces/Credential';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { Organization } from '../../../interfaces/Organization';
import { AwxRoute } from '../../../main/AwxRoutes';

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
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();

  const galaxyCredentials = useGalaxyCredentials(params.id || '0');
  const instanceGroups = useInstanceGroups(params.id || '0');

  if (!organization) {
    return <LoadingPage />;
  }

  // TODO look up license type from context (TBD) and add max hosts
  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{organization.name}</PageDetail>
      <PageDetail label={t('Description')}>{organization.description}</PageDetail>
      {/* {license_info?.license_type !== 'open' ? (
        <PageDetail label={t('Max hosts')}>{organization.max_hosts}</PageDetail>
      ) : null} */}
      <ExecutionEnvironmentDetail
        virtualEnvironment={organization.custom_virtualenv || undefined}
        executionEnvironment={organization.summary_fields?.default_environment}
        isDefaultEnvironment
        helpText={t`The execution environment that will be used for jobs
          inside of this organization. This will be used a fallback when
          an execution environment has not been explicitly assigned at the
          project, job template or workflow level.`}
      />
      <PageDetail label={t('Created')}>
        <DateTimeCell
          format="since"
          value={organization.created}
          author={organization.summary_fields?.created_by?.username}
          onClick={() =>
            pageNavigate(AwxRoute.UserDetails, {
              params: { id: (organization.summary_fields?.created_by?.id ?? 0).toString() },
            })
          }
        />
      </PageDetail>
      <LastModifiedPageDetail
        format="since"
        value={organization.modified}
        author={organization.summary_fields?.modified_by?.username}
        onClick={() =>
          pageNavigate(AwxRoute.UserDetails, {
            params: { id: (organization.summary_fields?.modified_by?.id ?? 0).toString() },
          })
        }
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
    </PageDetails>
  );
}
