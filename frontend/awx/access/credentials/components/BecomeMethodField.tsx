import { PageFormCreatableSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormCreatableSelect';
import { useTranslation } from 'react-i18next';

interface FieldOptions {
  id: string;
  label: string;
  help_text?: string;
}

interface BecomeMethodFieldProps {
  fieldOptions: FieldOptions;
  isRequired: boolean;
}

export function BecomeMethodField({ fieldOptions, isRequired }: BecomeMethodFieldProps) {
  const { t } = useTranslation();

  const initialSelectOptions: { value: string; label: string }[] = [
    'sudo',
    'su',
    'pbrun',
    'pfexec',
    'dzdo',
    'pmrun',
    'runas',
    'enable',
    'doas',
    'ksu',
    'machinectl',
    'sesu',
  ].map((val) => ({ value: val, label: val }));

  return (
    <PageFormCreatableSelect
      name={fieldOptions.id}
      placeholderText={t('Select a privilege escalation method')}
      label={t('Privilege Escalation Method')}
      options={initialSelectOptions}
      isMulti={false}
      isRequired={isRequired}
      toggleButtonId="become-method-toggle-button"
    />
  );
}
