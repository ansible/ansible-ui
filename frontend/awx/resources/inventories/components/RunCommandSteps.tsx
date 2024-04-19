import { useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import {
  PageDetail,
  PageDetails,
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormSelect,
  PageFormSwitch,
  PageFormTextInput,
} from '../../../../../framework';
import { PageFormCredentialSelect } from '../../../access/credentials/components/PageFormCredentialSelect';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { RunCommandWizard } from '../../../interfaces/Inventory';
import { LabelGroup } from '@patternfly/react-core';
import { CredentialLabel } from '../../../common/CredentialLabel';

export function RunCommandDetailStep() {
  const { t } = useTranslation();
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
      />
      <PageFormTextInput
        name="module_args"
        placeholder={t('Enter arguments')}
        isRequired
        label={t('Arguments')}
      />
      <PageFormSelect name="verbosity" label={t('Verbosity')} options={verbosityOptions} />
      <PageFormTextInput name="limit" label={t('Limit')} />
      <PageFormTextInput name="forks" label={t('Forks')} type="number" min={0} />
      <PageFormSwitch name="diff_mode" label={t('Show changes')} />
      <PageFormCheckbox name="become_enabled" label={t('Privilege escalation')} />
      <PageFormDataEditor
        labelHelpTitle={t('Extra Variables')}
        labelHelp={t(`Optional extra variables to be applied to job template`)}
        format="yaml"
        label={t('Extra Variables')}
        name="extra_vars"
      />
    </PageFormSection>
  );
}

export function RunCommandCredentialStep() {
  const { t } = useTranslation();

  return (
    <PageFormSection>
      <PageFormCredentialSelect
        name="credential"
        label={t('Credentials')}
        placeholder={t('Add credentials')}
        labelHelpTitle={t('Credentials')}
        labelHelp={t(
          'Select credentials for accessing the nodes this job will be ran against. You can only select one credential of each type. For machine credentials (SSH), checking "Prompt on launch" without selecting credentials will require you to select a machine credential at run time. If you select credentials and check "Prompt on launch", the selected credential(s) become the defaults that can be updated at run time.'
        )}
        isMultiple
        isRequired
      />
    </PageFormSection>
  );
}

export function RunCommandReviewStep() {
  const { t } = useTranslation();
  const { wizardData } = usePageWizard() as {
    wizardData: RunCommandWizard;
  };
  const {
    module,
    module_args,
    verbosity,
    limit,
    forks,
    diff_mode,
    become_enabled,
    extra_vars,
    credentials,
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
          <PageDetail label={t('Credentials')} isEmpty={!credentials?.length}>
            <LabelGroup>
              {credentials?.map((credential) => (
                <CredentialLabel credential={credential} key={credential.id} />
              ))}
            </LabelGroup>
          </PageDetail>
        </PageDetails>
      </PageFormSection>
    </>
  );
}
