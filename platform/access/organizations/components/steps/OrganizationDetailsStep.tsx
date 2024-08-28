import { Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormCredentialSelect } from '../../../../../frontend/awx/access/credentials/components/PageFormCredentialSelect';
import { PageFormSelectExecutionEnvironment } from '../../../../../frontend/awx/administration/execution-environments/components/PageFormSelectExecutionEnvironment';
import { PageFormInstanceGroupSelect } from '../../../../../frontend/awx/administration/instance-groups/components/PageFormInstanceGroupSelect';
import { useAwxConfig } from '../../../../../frontend/awx/common/useAwxConfig';
import { Organization as ControllerOrganization } from '../../../../../frontend/awx/interfaces/Organization';
import { useHasAwxService } from '../../../../main/GatewayServices';

export function OrganizationDetailsStep(props: {
  controllerOrganization?: ControllerOrganization;
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
  const config = useAwxConfig();

  return (
    <>
      <PageFormSelectExecutionEnvironment
        organizationId={controllerOrganization ? controllerOrganization.id : undefined}
        name="executionEnvironment"
        label={t('Execution environment')}
      />
      <PageFormInstanceGroupSelect
        name="instanceGroups"
        labelHelp={t(`Select the instance groups for this organization to run on.`)}
      />
      <PageFormCredentialSelect
        name="galaxyCredentials"
        label={t('Galaxy credentials')}
        placeholder={t('Add galaxy credentials')}
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
    </>
  );
}
