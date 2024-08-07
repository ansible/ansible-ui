import { useTranslation } from 'react-i18next';
import { PageFormGrid, PageFormTextInput } from '../../../../../../framework';
import { usePageWizard } from '../../../../../../framework/PageWizard/PageWizardProvider';
import type { TemplateLaunch } from '../TemplateLaunchWizard';
import { ConditionalField } from './ConditionalField';
import { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import { RelaunchConfig } from '../RelaunchTemplateWithPasswords';

export function CredentialPasswordsStep<T extends LaunchConfiguration | RelaunchConfig>(props: {
  config: T;
}) {
  const { config } = props;
  const { t } = useTranslation();
  const { wizardData } = usePageWizard();
  const {
    prompt: { credentials },
  } = wizardData as TemplateLaunch;
  const vaultsThatPrompt: string[] = [];
  let showCredentialPasswordSsh = false;
  let showCredentialPasswordPrivilegeEscalation = false;
  let showCredentialPasswordPrivateKeyPassphrase = false;

  if (
    !('ask_credential_on_launch' in config && config.ask_credential_on_launch) &&
    'passwords_needed_to_start' in config &&
    config.passwords_needed_to_start
  ) {
    config.passwords_needed_to_start.forEach((password: string) => {
      if (password === 'ssh_password') {
        showCredentialPasswordSsh = true;
      } else if (password === 'become_password') {
        showCredentialPasswordPrivilegeEscalation = true;
      } else if (password === 'ssh_key_unlock') {
        showCredentialPasswordPrivateKeyPassphrase = true;
      } else if (password.startsWith('vault_password')) {
        const vaultId = password.split(/\.(.+)/)[1] || '';
        vaultsThatPrompt.push(vaultId);
      }
    });
  } else if (credentials) {
    credentials.forEach((credential) => {
      if (!('inputs' in credential) && 'defaults' in config) {
        const launchConfigCredential = config.defaults.credentials.find(
          (defaultCred) => defaultCred.id === credential.id
        );

        if (launchConfigCredential && launchConfigCredential?.passwords_needed.length > 0) {
          if (launchConfigCredential.passwords_needed.includes('ssh_password')) {
            showCredentialPasswordSsh = true;
          }
          if (launchConfigCredential.passwords_needed.includes('become_password')) {
            showCredentialPasswordPrivilegeEscalation = true;
          }
          if (launchConfigCredential.passwords_needed.includes('ssh_key_unlock')) {
            showCredentialPasswordPrivateKeyPassphrase = true;
          }

          const vaultPasswordIds = launchConfigCredential.passwords_needed
            .filter((passwordNeeded) => passwordNeeded.startsWith('vault_password'))
            .map((vaultPassword) => vaultPassword.split(/\.(.+)/)[1] || '');

          vaultsThatPrompt.push(...vaultPasswordIds);
        }
      } else {
        const inputCheck = 'inputs' in credential;
        if (inputCheck && credential?.inputs?.password === 'ASK') {
          showCredentialPasswordSsh = true;
        }

        if (inputCheck && credential?.inputs?.become_password === 'ASK') {
          showCredentialPasswordPrivilegeEscalation = true;
        }

        if (inputCheck && credential?.inputs?.ssh_key_unlock === 'ASK') {
          showCredentialPasswordPrivateKeyPassphrase = true;
        }

        if (inputCheck && credential?.inputs?.vault_password === 'ASK') {
          vaultsThatPrompt.push(credential.inputs.vault_id?.toString() ?? '');
        }
      }
    });
  }

  return (
    <PageFormGrid isVertical singleColumn>
      <ConditionalField isHidden={!showCredentialPasswordSsh}>
        <PageFormTextInput<TemplateLaunch>
          id="launch-ssh-password"
          label={t('SSH password')}
          name="credential_passwords.ssh_password"
          placeholder={t('Enter a password')}
          type="password"
          isRequired
        />
      </ConditionalField>
      <ConditionalField isHidden={!showCredentialPasswordPrivateKeyPassphrase}>
        <PageFormTextInput<TemplateLaunch>
          id="launch-private-key-passphrase"
          label={t('Private key password')}
          name="credential_passwords.ssh_key_unlock"
          placeholder={t('Enter a password')}
          type="password"
          isRequired
        />
      </ConditionalField>
      <ConditionalField isHidden={!showCredentialPasswordPrivilegeEscalation}>
        <PageFormTextInput<TemplateLaunch>
          id="launch-privilege-escalation-password"
          label={t`Privilege escalation password`}
          name="credential_passwords.become_password"
          placeholder={t('Enter a password')}
          type="password"
          isRequired
        />
      </ConditionalField>
      {vaultsThatPrompt.map((credId) => {
        const passwordKey = `vault_password${credId !== '' ? `.${credId}` : ''}`;
        return (
          <PageFormTextInput<TemplateLaunch>
            key={credId}
            id={`launch-vault-password-${credId}`}
            label={credId === '' ? t`Vault password` : t(`Vault password | {{credId}}`, { credId })}
            name={`credential_passwords.${passwordKey}`}
            placeholder={t('Enter a password')}
            type="password"
            isRequired
          />
        );
      })}
    </PageFormGrid>
  );
}
