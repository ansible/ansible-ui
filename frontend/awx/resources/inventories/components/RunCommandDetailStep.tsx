import { useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import {
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormSelect,
  PageFormSwitch,
  PageFormTextInput,
} from '../../../../../framework';

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
      <PageFormSelect name={'module'} isRequired label={t('Module')} options={moduleOptions} />
      <PageFormTextInput name={'arguments'} label={t('Arguments')} />
      <PageFormSelect name={'verbosity'} label={t('Verbosity')} options={verbosityOptions} />
      <PageFormTextInput name={'limit'} label={t('Limit')} />
      <PageFormTextInput name={'forks'} label={t('Fork')} type="number" min={0} />
      <PageFormSwitch label={t('Show changes')} name="diff_mode" />
      <PageFormCheckbox label={t('Privilege escalation')} name="become_enabled" />
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
