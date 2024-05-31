import { useTranslation } from 'react-i18next';
import { TextContent, Text, TextVariants, LabelGroup, Label } from '@patternfly/react-core';
import { PageDetail, PageDetails, useGetPageUrl } from '../../../../../framework';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { OrganizationWizardFormValues } from '../PlatformOrganizationForm';
import { Link } from 'react-router-dom';
import { AwxRoute } from '../../../../../frontend/awx/main/AwxRoutes';
import { CredentialLabel } from '../../../../../frontend/awx/common/CredentialLabel';
import { ExecutionEnvironmentDetail } from '../../../../../frontend/awx/common/ExecutionEnvironmentDetail';
import { Organization as ControllerOrganization } from '../../../../../frontend/awx/interfaces/Organization';

export function OrganizationReviewStep(props: { controllerOrganization?: ControllerOrganization }) {
  const { t } = useTranslation();
  const controllerOrganization = props.controllerOrganization;
  const { wizardData } = usePageWizard();
  const getPageUrl = useGetPageUrl();

  const { organization, instanceGroups, galaxyCredentials, executionEnvironment } =
    wizardData as OrganizationWizardFormValues;

  return (
    <>
      <TextContent style={{ marginBottom: 25 }}>
        <Text component={TextVariants.h2}>{t('Review')}</Text>
      </TextContent>
      <PageDetails numberOfColumns="multiple">
        <PageDetail label={t('Name')}>{organization.name}</PageDetail>
        <PageDetail label={t('Description')}>{organization?.description}</PageDetail>
        {executionEnvironment && executionEnvironment.name !== undefined && (
          <ExecutionEnvironmentDetail
            virtualEnvironment={controllerOrganization?.custom_virtualenv || undefined}
            executionEnvironment={executionEnvironment}
            verifyMissingVirtualEnv
            isDefaultEnvironment
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
      </PageDetails>
    </>
  );
}
