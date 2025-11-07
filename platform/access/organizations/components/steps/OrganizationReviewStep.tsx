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
import {
  Alert,
  Content,
  ContentVariants,
  Label,
  LabelGroup,
  PageSection,
} from '@patternfly/react-core';
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
      <Content style={{ marginBottom: 25 }}>
        <Content component={ContentVariants.h2}>{t('Review')}</Content>
      </Content>
      {controllerOrganization ? null : (
        <PageSection padding={{ default: 'noPadding' }}>
          <Alert
            variant="info"
            isInline
            isPlain
            title={t('New organizations can take up to 15 minutes to propagate across the system.')}
          />
        </PageSection>
      )}
      <PageDetails numberOfColumns="multiple" disablePadding>
        <PageDetail label={t('Name')}>{organization.name}</PageDetail>
        <PageDetail label={t('Description')}>{organization?.description}</PageDetail>
        {fetchedEE && fetchedEE.name !== undefined && (
          <ExecutionEnvironmentDetail
            virtualEnvironment={controllerOrganization?.custom_virtualenv || undefined}
            executionEnvironment={fetchedEE}
            verifyMissingVirtualEnv
            isDefaultEnvironment={false}
            helpText={t`The execution environment that will be used for jobs
          inside of this organization. This will be used as a fallback when
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
                <Label
                  isClickable
                  color="blue"
                  key={ig.id}
                  render={({ content, className }) => (
                    <Link
                      className={className}
                      to={getPageUrl(AwxRoute.InstanceGroupDetails, {
                        params: { id: ig.id },
                      })}
                    >
                      {content}
                    </Link>
                  )}
                >
                  {ig.name}
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
        {policy && <PageDetail label={t('Policy enforcement')}>{policy}</PageDetail>}
      </PageDetails>
    </>
  );
}
