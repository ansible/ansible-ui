import { Trans, useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import {
  PageDetail,
  PageDetails,
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormSelect,
  PageFormSwitch,
  PageFormTextInput,
  useGetPageUrl,
} from '../../../../../framework';
import { PageFormCredentialSelect } from '../../../access/credentials/components/PageFormCredentialSelect';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { RunCommandWizard } from '../../../interfaces/Inventory';
import { LabelGroup } from '@patternfly/react-core';
import { CredentialLabel } from '../../../common/CredentialLabel';
import { Link } from 'react-router-dom';
import { PageFormExecutionEnvironmentSelect } from '../../../administration/execution-environments/components/PageFormExecutionEnvironmentSelect';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useWatch } from 'react-hook-form';

export function RunCommandDetailStep() {
  const { t } = useTranslation();
  const module = useWatch<RunCommandWizard>({
    name: 'module',
  });
  const moduleOptions = [
    { label: t('command'), value: 'command' },
    { label: t('shell'), value: 'shell' },
    { label: t('yum'), value: 'yum' },
    { label: t('apt'), value: 'apt' },
    { label: t('apt_key'), value: 'apt_key' },
    { label: t('apt_repository'), value: 'apt_repository' },
    { label: t('apt_rpm'), value: 'apt_rpm' },
    { label: t('service'), value: 'service' },
    { label: t('group'), value: 'group' },
    { label: t('user'), value: 'user' },
    { label: t('mount'), value: 'mount' },
    { label: t('ping'), value: 'ping' },
    { label: t('selinux'), value: 'selinux' },
    { label: t('setup'), value: 'setup' },
    { label: t('win_ping'), value: 'win_ping' },
    { label: t('win_service'), value: 'win_service' },
    { label: t('win_updates'), value: 'win_updates' },
    { label: t('win_group'), value: 'win_group' },
    { label: t('win_user'), value: 'win_user' },
  ];

  const verbosityOptions = [
    { label: t('0 (Normal)'), value: '0' },
    { label: t('1 (Verbose)'), value: '1' },
    { label: t('2 (More Verbose)'), value: '2' },
    { label: t('3 (Debug)'), value: '3' },
    { label: t('4 (Connection Debug)'), value: '4' },
    { label: t('5 (WinRM Debug)'), value: '5' },
  ];

  return (
    <PageFormSection singleColumn>
      <PageFormSelect
        name="module"
        placeholderText={t('Select a module')}
        isRequired
        label={t('Module')}
        options={moduleOptions}
        labelHelpTitle={t('Module')}
        labelHelp={t(`These are the modules that AWX supports running commands against.`)}
      />
      <PageFormTextInput
        name="module_args"
        placeholder={t('Enter arguments')}
        isRequired={module === 'command' || module === 'shell'}
        label={t('Arguments')}
        labelHelpTitle={t('Arguments')}
        labelHelp={t(`These arguments are used with the specified module.`)}
      />
      <PageFormSelect
        name="verbosity"
        label={t('Verbosity')}
        options={verbosityOptions}
        labelHelpTitle={t('Verbosity')}
        labelHelp={t(
          `These are the verbosity levels for standard out of the command run that are supported.`
        )}
      />
      <PageFormTextInput
        name="limit"
        label={t('Limit')}
        labelHelpTitle={t('Limit')}
        labelHelp={
          <>
            <Trans>
              The pattern used to target hosts in the inventory. Leaving the field blank, all, and *
              will all target all hosts in the inventory. You can find more information about
              Ansible&aposs host patterns{' '}
            </Trans>
            <Trans>
              <Link
                to="https://docs.ansible.com/ansible/latest/user_guide/intro_patterns.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </Link>
            </Trans>
          </>
        }
      />
      <PageFormTextInput
        name="forks"
        label={t('Forks')}
        type="number"
        min={0}
        labelHelpTitle={t('Forks')}
        labelHelp={
          <>
            <Trans>
              The number of parallel or simultaneous processes to use while executing the playbook.
              Inputting no value will use the default value from the ansible configuration file. You
              can find more information{' '}
            </Trans>
            <Trans>
              <Link
                to="https://docs.ansible.com/ansible/latest/installation_guide/intro_configuration.html#the-ansible-configuration-file"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </Link>
            </Trans>
          </>
        }
      />
      <PageFormSwitch
        name="diff_mode"
        label={t('Show changes')}
        labelHelpTitle={t('Show changes')}
        labelHelp={t(
          `If enabled, show the changes made by Ansible tasks, where supported. This is equivalent to Ansible’s --diff mode.`
        )}
      />
      <PageFormCheckbox
        name="become_enabled"
        label={t('Privilege escalation')}
        labelHelpTitle={t('Privilege escalation')}
        labelHelp={t(
          `Enables creation of a provisioning callback URL. Using the URL a host can contact AWX and request a configuration update using this job template --become option to the  ansible command`
        )}
      />
      <PageFormDataEditor
        labelHelpTitle={t('Extra Variables')}
        labelHelp={t(`Optional extra variables to be applied to run command`)}
        format="yaml"
        label={t('Extra Variables')}
        name="extra_vars"
      />
    </PageFormSection>
  );
}

export function RunCommandExecutionEnvionment(props: { orgId: string }) {
  const { t } = useTranslation();
  return (
    <PageFormSection>
      <PageFormExecutionEnvironmentSelect
        name="execution_environment.name"
        executionEnvironmentIdPath="execution_environment.id"
        label={t('Execution Environment')}
        organizationId={props.orgId ?? ''}
      />
    </PageFormSection>
  );
}

export function RunCommandCredentialStep() {
  const { t } = useTranslation();

  return (
    <PageFormSection>
      <PageFormCredentialSelect
        name="credential.name"
        label={t('Credential')}
        placeholder={t('Add credential')}
        labelHelpTitle={t('Credential')}
        labelHelp={t(
          'Select the credential you want to use when accessing the remote hosts to run the command. Choose the credential containing the username and SSH key or password that Ansible will need to log into the remote hosts.'
        )}
        isRequired
        credentialIdPath="credentialIdPath"
        sourceType="ssh"
      />
    </PageFormSection>
  );
}

export function RunCommandReviewStep() {
  const { t } = useTranslation();
  const { wizardData } = usePageWizard() as {
    wizardData: RunCommandWizard;
  };
  const getPageUrl = useGetPageUrl();
  const {
    module,
    module_args,
    verbosity,
    limit,
    forks,
    diff_mode,
    become_enabled,
    extra_vars,
    execution_environment,
    credential,
    credentialIdPath,
  } = wizardData;

  return (
    <>
      <PageFormSection title={t('Review')} singleColumn>
        <PageDetails disablePadding>
          <PageDetail label={t('Module')}>{module}</PageDetail>
          <PageDetail label={t('Arguments')}>{module_args}</PageDetail>
          <PageDetail label={t('Verbosity')}>{verbosity}</PageDetail>
          <PageDetail label={t('Limit')}>{limit}</PageDetail>
          <PageDetail label={t('Forks')}>{forks}</PageDetail>
          <PageDetail label={t('Show changes')}>{diff_mode ? t('On') : t('Off')}</PageDetail>
          <PageDetail label={t('Privilege escalation')}>
            {become_enabled ? t('On') : t('Off')}
          </PageDetail>
          <PageDetailCodeEditor label={t('Extra vars')} value={extra_vars} />
          <PageDetail label={t('Credentials')} isEmpty={!credential}>
            <LabelGroup>
              <CredentialLabel
                credential={{
                  name: credential.name,
                  id: parseInt(credentialIdPath),
                  kind: 'ssh',
                  cloud: false,
                  description: credential.name,
                }}
                key={credentialIdPath}
              />
            </LabelGroup>
          </PageDetail>
          <PageDetail label={t('Execution environment')}>
            <Link
              to={getPageUrl(AwxRoute.ExecutionEnvironmentDetails, {
                params: { id: execution_environment.id },
              })}
            >
              {execution_environment.name}
            </Link>
          </PageDetail>
        </PageDetails>
      </PageFormSection>
    </>
  );
}
