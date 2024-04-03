import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { WizardFormValues } from '../../../awx/resources/templates/WorkflowVisualizer/types';
import { PageFormTextInput } from '../../../../framework';

export function AliasInput() {
  const { t } = useTranslation();
  const {
    formState: { defaultValues },
  } = useFormContext<WizardFormValues>();
  const isAliasRequired = defaultValues?.node_alias !== '';

  return (
    <PageFormTextInput<WizardFormValues>
      label={t('Node alias')}
      name="node_alias"
      data-cy="node-alias"
      labelHelpTitle={t('Node alias')}
      labelHelp={t(
        'If specified, this field will be shown on the node instead of the resource name when viewing the workflow'
      )}
      isRequired={isAliasRequired}
    />
  );
}
