import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LabelGroup } from '@patternfly/react-core';
import { PageDetails, PageDetail, PageDetailsFromColumns } from '../../../../framework';
import { CredentialLabel } from '../../../../frontend/awx/common/CredentialLabel';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { useOrganizationColumns } from '../hooks/useOrganizationColumns';
import { Organization as AwxOrganization } from '../../../../frontend/awx/interfaces/Organization';
import { ExecutionEnvironmentDetail } from '../../../../frontend/awx/common/ExecutionEnvironmentDetail';
import { useAwxResource } from '../../../hooks/useAwxResource';

export function PlatformOrganizationDetails() {
  const { t } = useTranslation();
  const columns = useOrganizationColumns();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: organization } = useGet<PlatformOrganization>(
    gatewayV1API`/organizations/${id.toString()}/`
  );
  const { resource: awxOrganization } = useAwxResource<AwxOrganization>(
    '/organizations/',
    organization
  );
  const galaxyCredentials = useGalaxyCredentials(awxOrganization?.id.toString() || '0');

  return (
    <PageDetails>
      <PageDetailsFromColumns item={organization} columns={columns} />
      {awxOrganization ? (
        <>
          <ExecutionEnvironmentDetail
            virtualEnvironment={awxOrganization.custom_virtualenv || undefined}
            executionEnvironment={awxOrganization.summary_fields?.default_environment}
            isDefaultEnvironment
            helpText={t`The execution environment that will be used for jobs
          inside of this organization. This will be used a fallback when
          an execution environment has not been explicitly assigned at the
          project, job template or workflow level.`}
          />
          <PageDetail label={t('Galaxy credentials')} isEmpty={galaxyCredentials.length === 0}>
            <LabelGroup>
              {galaxyCredentials?.map((credential) => (
                <CredentialLabel credential={credential} key={credential.id} />
              ))}
            </LabelGroup>
          </PageDetail>
        </>
      ) : null}
    </PageDetails>
  );
}

function useGalaxyCredentials(orgId: string) {
  const { data } = useGet<{ results: Credential[] }>(
    awxAPI`/organizations/${orgId}/galaxy_credentials/`
  );
  return data?.results ?? [];
}
