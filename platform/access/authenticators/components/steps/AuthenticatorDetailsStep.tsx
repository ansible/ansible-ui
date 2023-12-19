import { useTranslation } from 'react-i18next';
import {
  PageFormGrid,
  PageFormTextInput,
  PageFormSwitch,
  PageFormDataEditor,
} from '../../../../../framework';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import type {
  AuthenticatorPlugins,
  PluginConfiguration,
} from '../../../../interfaces/AuthenticatorPlugin';
import type { AuthenticatorForm } from '../AuthenticatorForm';

/* TODO: more intelligent categorization of field type to input type
    pending updates to the API */
const textInputTypes = [
  'CharField',
  'URLField',
  'URLListField',
  'ChoiceField',
  'DNField',
  'PublicCert',
  'PrivateKey',
];
const dataInputTypes = [
  'JSONField',
  'DictField',
  'ListField',
  'LDAPConnectionOptions',
  'LDAPSearchField',
  'UserAttrMap',
];

export function AuthenticatorDetailsStep(props: { plugins: AuthenticatorPlugins }) {
  const { t } = useTranslation();
  const { wizardData } = usePageWizard();

  const authenticator = props.plugins.authenticators.find(
    (authenticator) => authenticator.type === (wizardData as AuthenticatorForm).type
  );
  const schema = authenticator?.configuration_schema || [];
  const textFields: PluginConfiguration[] = [];
  const boolFields: PluginConfiguration[] = [];
  const dataFields: PluginConfiguration[] = [];
  schema.forEach((field) => {
    if (textInputTypes.includes(field.type)) {
      textFields.push(field);
    } else if (field.type === 'BooleanField') {
      boolFields.push(field);
    } else if (dataInputTypes.includes(field.type)) {
      dataFields.push(field);
    }
  });

  return (
    <>
      <PageFormGrid isVertical>
        <PageFormTextInput name="name" label={t('Name')} isRequired />
        {textFields.map((field) => (
          <PageFormTextInput
            id={`schema-input-${field.name}`}
            name={`schema.${field.name}`}
            key={field.name}
            label={field.ui_field_label || field.name}
            isRequired={field.required}
            labelHelpTitle={field.ui_field_label || field.name}
            labelHelp={field.help_text}
          />
        ))}
        {boolFields.map((field) => (
          <PageFormSwitch
            id={`schema-input-${field.name}`}
            name={`schema.${field.name}`}
            key={field.name}
            label={field.ui_field_label || field.name}
            isRequired={field.required}
            labelHelpTitle={field.ui_field_label || field.name}
            labelHelp={field.help_text}
          />
        ))}
      </PageFormGrid>
      <PageFormGrid isVertical singleColumn>
        {dataFields.map((field) => (
          <PageFormDataEditor
            id={`schema-editor-${field.name}`}
            name={`schema.${field.name}`}
            key={field.name}
            label={field.ui_field_label || field.name}
            labelHelpTitle={field.ui_field_label || field.name}
            labelHelp={field.help_text}
          />
        ))}
      </PageFormGrid>
    </>
  );
}
