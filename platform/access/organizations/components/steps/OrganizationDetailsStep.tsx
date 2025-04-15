import { PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { PageFormCredentialSelect } from '@ansible/awx-ui/access/credentials/components/PageFormCredentialSelect';
import { PageFormSelectExecutionEnvironment } from '@ansible/awx-ui/administration/execution-environments/components/PageFormSelectExecutionEnvironment';
import { PageFormInstanceGroupSelect } from '@ansible/awx-ui/administration/instance-groups/components/PageFormInstanceGroupSelect';
import { useAwxConfig } from '@ansible/awx-ui/common/useAwxConfig';
import { Organization as ControllerOrganization } from '@ansible/awx-ui/interfaces/Organization';
import { Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useTranslation, Trans } from 'react-i18next';
import { useHasAwxService } from '../../../../main/GatewayServices';
import { useFeatureFlag } from '@ansible/awx-ui/common/useFeatureFlags';

export function OrganizationDetailsStep(props: {
  controllerOrganization?: ControllerOrganization;
  managed: boolean;
}) {
  const { t } = useTranslation();
  const awxService = useHasAwxService();
  const controllerOrganization = props.controllerOrganization;

  return (
    <>
      <TextContent>
        <Text component={TextVariants.h2}>{t('Organization details')}</Text>
      </TextContent>
      <PageFormSection>
        <PageFormTextInput
          name="organization.name"
          label={t('Name')}
          placeholder={t('Enter organization name')}
          isDisabled={props.managed}
          isRequired
        />
        <PageFormTextInput
          label={t('Description')}
          name="organization.description"
          placeholder={t('Enter description')}
        />
        {awxService && (
          <ControllerOrganizationDetails controllerOrganization={controllerOrganization} />
        )}
      </PageFormSection>
    </>
  );
}

function ControllerOrganizationDetails(props: { controllerOrganization?: ControllerOrganization }) {
  const { t } = useTranslation();
  const controllerOrganization = props.controllerOrganization;
  const config = useAwxConfig();
  const hasPolicyAsCodeFlag = useFeatureFlag('FEATURE_POLICY_AS_CODE_ENABLED');

  return (
    <>
      <PageFormSelectExecutionEnvironment
        organizationId={controllerOrganization ? controllerOrganization.id : undefined}
        name="executionEnvironment"
        label={t('Execution environment')}
        labelHelp={t`The execution environment that will be used for jobs
          inside of this organization. This will be used as a fallback when
          an execution environment has not been explicitly assigned at the
          project, job template or workflow level.`}
      />
      <PageFormInstanceGroupSelect
        name="instanceGroups"
        labelHelp={t(`Select the instance groups for this organization to run on.`)}
      />
      <PageFormCredentialSelect
        name="galaxyCredentials"
        label={t('Galaxy credentials')}
        placeholder={t('Select galaxy credentials')}
        queryParams={{
          credential_type__kind: 'galaxy',
        }}
        isMultiple
        allowDuplicateCredentialTypes
      />
      {config && config?.license_info.license_type !== 'open' && (
        <PageFormTextInput
          name="maxHosts"
          label={t('Max hosts')}
          labelHelpTitle={t('Max hosts')}
          type="number"
          min={0}
          validate={(val) => {
            const maxHosts = Number.parseFloat(val);
            if (Number.isInteger(maxHosts) && maxHosts >= 0 && maxHosts <= 2147483647) {
              return undefined;
            }
            return t('This field must be an integer and have a value between 0 and 2147483647.');
          }}
        />
      )}
      {hasPolicyAsCodeFlag && (
        <PageFormTextInput
          label={t('OPA query path')}
          name="policy"
          placeholder={t('Enter OPA query path')}
          labelHelp={
            <Trans>
              <p>The query path for the OPA policy to evaluate prior to job execution.</p>
              <br />
              <p>
                The query path should be formatted as {`{`}package{'}'}/{'{'}rule{'}'}.
              </p>
            </Trans>
          }
          labelHelpTitle={t('OPA query path')}
          helperText={t('Format must be {package}/{rule}')}
        />
      )}
    </>
  );
}
