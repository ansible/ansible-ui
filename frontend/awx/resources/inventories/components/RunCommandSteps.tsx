import {
  PageDetail,
  PageDetails,
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormSelect,
  PageFormSwitch,
  PageFormTextInput,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { PageDetailCodeEditor } from '@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ExternalLink } from '@ansible/hub-ui/common/ExternalLink';
import { LabelGroup } from '@patternfly/react-core';
import { useEffect, Dispatch, SetStateAction } from 'react';
import { useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageFormCredentialSelect } from '../../../access/credentials/components/PageFormCredentialSelect';
import { PageFormSelectExecutionEnvironment } from '../../../administration/execution-environments/components/PageFormSelectExecutionEnvironment';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxError } from '../../../common/AwxError';
import { CredentialLabel } from '../../../common/CredentialLabel';
import { Credential } from '../../../interfaces/Credential';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { RunCommandWizard } from '../../../interfaces/Inventory';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { AwxRoute } from '../../../main/AwxRoutes';

export function RunCommandDetailStep() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('Automation controller');
  const module = useWatch<RunCommandWizard>({
    name: 'module_name',
  });
  const { data, error, isLoading } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/ad_hoc_commands/`
  );

  if (isLoading) return <LoadingState />;
  if (error) return <AwxError error={error} />;

  const moduleOptions = data?.actions?.GET?.module_name?.choices?.map(([name, label]) => ({
    name,
    label,
    value: label,
  })) as PageSelectOption<string>[];
  const verbosityOptions = data?.actions?.GET?.verbosity?.choices?.map(([name, label]) => ({
    name: name.toString(),
    label,
    value: name,
  })) as PageSelectOption<string>[];

  return (
    <PageFormSection singleColumn>
      <PageFormSelect
        name="module_name"
        placeholderText={t('Select a module')}
        isRequired
        label={t('Module')}
        options={moduleOptions}
        labelHelpTitle={t('Module')}
        labelHelp={t(`These are the modules that {{product}} supports running commands against.`, {
          product,
        })}
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
        isRequired
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
              <ExternalLink href="https://docs.ansible.com/ansible/latest/user_guide/intro_patterns.html">
                here
              </ExternalLink>
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
              <ExternalLink href="https://docs.ansible.com/ansible/latest/installation_guide/intro_configuration.html#the-ansible-configuration-file">
                here
              </ExternalLink>
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
          `Enables creation of a provisioning callback URL. Using the URL a host can contact {{product}} and request a configuration update using this job template --become option to the ansible command`,
          { product }
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
      <PageFormSelectExecutionEnvironment
        name="execution_environment"
        label={t('Execution Environment')}
        organizationId={Number(props.orgId) ?? ''}
      />
    </PageFormSection>
  );
}

export function RunCommandCredentialStep() {
  const { t } = useTranslation();
  const credentialId = useWatch<RunCommandWizard>({ name: 'credential' });
  const { setWizardData } = usePageWizard() as {
    setWizardData: Dispatch<SetStateAction<RunCommandWizard>>;
  };

  // Fetch credential to check if it needs password prompts
  const { data: credential } = useGet<Credential>(
    credentialId ? awxAPI`/credentials/${String(credentialId)}/` : ''
  );

  // Update wizard data with password requirements when credential changes
  useEffect(() => {
    if (credential) {
      const needsPasswords =
        credential.inputs?.password === 'ASK' ||
        credential.inputs?.become_password === 'ASK' ||
        credential.inputs?.ssh_key_unlock === 'ASK' ||
        credential.inputs?.vault_password === 'ASK';

      setWizardData((prev) => ({
        ...prev,
        credentialNeedsPasswords: needsPasswords,
      }));
    } else {
      setWizardData((prev) => ({
        ...prev,
        credentialNeedsPasswords: undefined,
      }));
    }
  }, [credential, setWizardData]);

  return (
    <PageFormSection>
      <PageFormCredentialSelect
        name="credential"
        label={t('Credential')}
        labelHelp={t(
          'Select the credential you want to use when accessing the remote hosts to run the command. Choose the credential containing the username and SSH key or password that Ansible will need to log into the remote hosts.'
        )}
        queryParams={{
          credential_type__namespace: 'ssh',
        }}
        isRequired
      />
    </PageFormSection>
  );
}

export function RunCommandCredentialPasswordsStep() {
  const { t } = useTranslation();
  const { wizardData } = usePageWizard() as { wizardData: RunCommandWizard };
  const credentialId = wizardData?.credential;

  const { data: credential, isLoading } = useGet<Credential>(
    credentialId ? awxAPI`/credentials/${String(credentialId)}/` : ''
  );

  if (isLoading || !credential) {
    return <LoadingState />;
  }

  const showSshPassword = credential.inputs?.password === 'ASK';
  const showBecomePassword = credential.inputs?.become_password === 'ASK';
  const showSshKeyUnlock = credential.inputs?.ssh_key_unlock === 'ASK';
  const showVaultPassword = credential.inputs?.vault_password === 'ASK';
  const vaultId = credential.inputs?.vault_id?.toString() ?? '';

  return (
    <PageFormSection singleColumn>
      {showSshPassword && (
        <PageFormTextInput
          id="run-command-ssh-password"
          label={t('SSH password')}
          name="credential_passwords.ssh_password"
          placeholder={t('Enter a password')}
          type="password"
          isRequired
        />
      )}
      {showSshKeyUnlock && (
        <PageFormTextInput
          id="run-command-private-key-passphrase"
          label={t('Private key password')}
          name="credential_passwords.ssh_key_unlock"
          placeholder={t('Enter a password')}
          type="password"
          isRequired
        />
      )}
      {showBecomePassword && (
        <PageFormTextInput
          id="run-command-privilege-escalation-password"
          label={t('Privilege escalation password')}
          name="credential_passwords.become_password"
          placeholder={t('Enter a password')}
          type="password"
          isRequired
        />
      )}
      {showVaultPassword && (
        <PageFormTextInput
          id={`run-command-vault-password-${vaultId}`}
          label={
            vaultId === '' ? t('Vault password') : t('Vault password | {{vaultId}}', { vaultId })
          }
          name={`credential_passwords.vault_password${vaultId !== '' ? `.${vaultId}` : ''}`}
          placeholder={t('Enter a password')}
          type="password"
          isRequired
        />
      )}
    </PageFormSection>
  );
}

export function shouldHideCredentialPasswordsStep(
  wizardData: Partial<RunCommandWizard> & { credentialNeedsPasswords?: boolean }
): boolean {
  // Hide if no credential selected or if credential doesn't need passwords
  if (!wizardData?.credential) {
    return true;
  }
  // If we haven't fetched the credential data yet, hide the step
  // (it will appear once the credential data is loaded)
  if (wizardData.credentialNeedsPasswords === undefined) {
    return true;
  }
  return !wizardData.credentialNeedsPasswords;
}

export function RunCommandReviewStep() {
  const { t } = useTranslation();
  const { wizardData } = usePageWizard() as {
    wizardData: RunCommandWizard;
  };
  const getPageUrl = useGetPageUrl();
  const {
    module_name,
    module_args,
    verbosity,
    limit,
    forks,
    diff_mode,
    become_enabled,
    extra_vars,
    execution_environment,
    credential: credentialId,
  } = wizardData;
  const { data: credential } = useGet<Credential>(awxAPI`/credentials/${credentialId.toString()}/`);

  const { data: fetchedEE } = useGetItem<ExecutionEnvironment>(
    awxAPI`/execution_environments/`,
    execution_environment
  );

  return (
    <PageFormSection title={t('Review')} singleColumn>
      <PageDetails disablePadding>
        <PageDetail label={t('Module')}>{module_name}</PageDetail>
        <PageDetail label={t('Arguments')}>{module_args}</PageDetail>
        <PageDetail label={t('Verbosity')}>{verbosity}</PageDetail>
        <PageDetail label={t('Limit')}>{limit}</PageDetail>
        <PageDetail label={t('Forks')}>{forks}</PageDetail>
        <PageDetail label={t('Show changes')}>{diff_mode ? t('On') : t('Off')}</PageDetail>
        <PageDetail label={t('Privilege escalation')}>
          {become_enabled ? t('On') : t('Off')}
        </PageDetail>
        <PageDetailCodeEditor label={t('Extra vars')} value={extra_vars} />
        {credential ? (
          <PageDetail label={t('Credentials')} isEmpty={!credential}>
            <LabelGroup>
              <CredentialLabel
                credential={{
                  name: credential.name,
                  id: parseInt(credential.id.toString()),
                  kind: 'ssh',
                  cloud: false,
                  description: credential.name,
                }}
                key={credential.id}
              />
            </LabelGroup>
          </PageDetail>
        ) : null}
        <PageDetail label={t('Execution environment')}>
          <Link
            to={getPageUrl(AwxRoute.ExecutionEnvironmentDetails, {
              params: { id: String(execution_environment) },
            })}
          >
            {fetchedEE?.name}
          </Link>
        </PageDetail>
      </PageDetails>
    </PageFormSection>
  );
}
