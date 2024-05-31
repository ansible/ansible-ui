import { Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { useAwxService } from '../../../../main/GatewayServices';
import { PageFormInstanceGroupSelect } from '../../../../../frontend/awx/administration/instance-groups/components/PageFormInstanceGroupSelect';
import { PageFormExecutionEnvironmentSelect } from '../../../../../frontend/awx/administration/execution-environments/components/PageFormExecutionEnvironmentSelect';
import { PageFormCredentialSelect } from '../../../../../frontend/awx/access/credentials/components/PageFormCredentialSelect';
import { useGetCredentialTypeIDs } from '../../../../../frontend/awx/resources/projects/hooks/useGetCredentialTypeIDs';
import { Organization as ControllerOrganization } from '../../../../../frontend/awx/interfaces/Organization';

export function OrganizationDetailsStep(props: {
  controllerOrganization?: ControllerOrganization;
}) {
  const { t } = useTranslation();
  const awxService = useAwxService();
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
          placeholder={t('Enter name')}
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
  const credentialTypeIDs = useGetCredentialTypeIDs();

  return (
    <>
      <PageFormExecutionEnvironmentSelect
        organizationId={controllerOrganization ? controllerOrganization.id.toString() : undefined}
        name="executionEnvironment.name"
        label={t('Default execution environment')}
        executionEnvironmentPath="executionEnvironment"
        executionEnvironmentIdPath="executionEnvironment.id"
      />
      <PageFormInstanceGroupSelect
        name="instanceGroups"
        labelHelp={t(`Select the instance groups for this organization to run on.`)}
      />
      <PageFormCredentialSelect
        name="galaxyCredentials"
        label={t('Galaxy credentials')}
        labelHelpTitle={t('Galaxy credentials')}
        selectTitle={t('Galaxy credentials')}
        credentialType={credentialTypeIDs.galaxy}
        placeholder={t('Add galaxy credentials')}
        isMultiple
      />
    </>
  );
}
