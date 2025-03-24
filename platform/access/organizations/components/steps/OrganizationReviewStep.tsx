import { PageDetail, PageDetails, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { CredentialLabel } from '@ansible/awx-ui/common/CredentialLabel';
import { ExecutionEnvironmentDetail } from '@ansible/awx-ui/common/ExecutionEnvironmentDetail';
import { useAwxConfig } from '@ansible/awx-ui/common/useAwxConfig';
import { ExecutionEnvironment } from '@ansible/awx-ui/interfaces/ExecutionEnvironment';
import { Organization as ControllerOrganization } from '@ansible/awx-ui/interfaces/Organization';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { Label, LabelGroup, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { OrganizationWizardFormValues } from '../PlatformOrganizationForm';

export function OrganizationReviewStep(props: { controllerOrganization?: ControllerOrganization }) {
  const { t } = useTranslation();
  const controllerOrganization = props.controllerOrganization;
  const { wizardData } = usePageWizard();
  const getPageUrl = useGetPageUrl();
  const config = useAwxConfig();

  const {
    organization,
    instanceGroups,
    galaxyCredentials,
    maxHosts,
    executionEnvironment,
    policy,
  } = wizardData as OrganizationWizardFormValues;

  let fetchedEE: ExecutionEnvironment | undefined;

  const { data } = useGetItem<ExecutionEnvironment>(
    awxAPI`/execution_environments/`,
    executionEnvironment
  );
  if (data) {
    fetchedEE = data;
  }

  return (
    <>
      <TextContent style={{ marginBottom: 25 }}>
        <Text component={TextVariants.h2}>{t('Review')}</Text>
      </TextContent>
      <PageDetails numberOfColumns="multiple">
        <PageDetail label={t('Name')}>{organization.name}</PageDetail>
        <PageDetail label={t('Description')}>{organization?.description}</PageDetail>
        {fetchedEE && fetchedEE.name !== undefined && (
          <ExecutionEnvironmentDetail
            virtualEnvironment={controllerOrganization?.custom_virtualenv || undefined}
            executionEnvironment={fetchedEE}
            verifyMissingVirtualEnv
            isDefaultEnvironment={false}
            helpText={t`The execution environment that will be used for jobs
          inside of this organization. This will be used a fallback when
          an execution environment has not been explicitly assigned at the
          project, job template or workflow level.`}
          />
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
        {Boolean(maxHosts) && config && config?.license_info.license_type !== 'open' && (
          <PageDetail label={t('Max Hosts')} isEmpty={maxHosts === 0}>
            {maxHosts}
          </PageDetail>
        )}
        {policy && <PageDetail label={t('OPA query path')}>{policy}</PageDetail>}
      </PageDetails>
    </>
  );
}
