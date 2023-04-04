import { Label, LabelGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageDetail, PageDetails, DateTimeCell } from '../../../../../framework';
import { useGet } from '../../../../common/crud/useGet';
import { RouteObj } from '../../../../Routes';
import { CredentialLabel } from '../../../common/CredentialLabel';
import { ExecutionEnvironmentDetail } from '../../../common/ExecutionEnvironmentDetail';
import { Credential } from '../../../interfaces/Credential';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { Organization } from '../../../interfaces/Organization';

function useGalaxyCredentials(orgId: string) {
  const { data } = useGet<{ results: Credential[] }>(
    `/api/v2/organizations/${orgId}/galaxy_credentials/`
  );
  return data?.results ?? [];
}

function useInstanceGroups(orgId: string) {
  const { data } = useGet<{ results: InstanceGroup[] }>(
    `/api/v2/organizations/${orgId}/instance_groups/`
  );
  return data?.results ?? [];
}

export function OrganizationDetails(props: { organization: Organization }) {
  const { t } = useTranslation();
  const { organization } = props;
  const history = useNavigate();
  const params = useParams<{ id: string }>();

  const galaxyCredentials = useGalaxyCredentials(params.id || '0');
  const instanceGroups = useInstanceGroups(params.id || '0');

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
            history(
              RouteObj.UserDetails.replace(
                ':id',
                (organization.summary_fields?.created_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
      <PageDetail label={t('Last modified')}>
        <DateTimeCell
          format="since"
          value={organization.modified}
          author={organization.summary_fields?.modified_by?.username}
          onClick={() =>
            history(
              RouteObj.UserDetails.replace(
                ':id',
                (organization.summary_fields?.modified_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
      <PageDetail
        label={t`Instance Groups`}
        helpText={t`The Instance Groups for this Organization to run on.`}
        isEmpty={instanceGroups.length === 0}
      >
        <LabelGroup>
          {instanceGroups.map((ig) => (
            <Label color="blue" key={ig.id}>
              <Link to={RouteObj.InstanceGroupDetails.replace(':id', (ig.id ?? 0).toString())}>
                {ig.name}
              </Link>
            </Label>
          ))}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Galaxy Credentials')} isEmpty={galaxyCredentials.length === 0}>
        <LabelGroup>
          {galaxyCredentials?.map((credential) => (
            <CredentialLabel credential={credential} key={credential.id} />
          ))}
        </LabelGroup>
      </PageDetail>
    </PageDetails>
  );
}
