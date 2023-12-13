import { useTranslation } from 'react-i18next';
import { PageFormGrid, PageFormTextInput, PageFormSwitch } from '../../../../../framework';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import type {
  AuthenticatorPlugins,
  PluginConfiguration,
} from '../../../../interfaces/AuthenticatorPlugin';
import type { AuthenticatorForm } from '../AuthenticatorForm';

export function AuthenticatorDetailsStep(props: { plugins: AuthenticatorPlugins }) {
  const { t } = useTranslation();
  const { wizardData } = usePageWizard();

  console.log(wizardData);

  const authenticator = props.plugins.authenticators.find(
    (authenticator) => authenticator.type === (wizardData as AuthenticatorForm).type
  );
  const schema = authenticator?.configuration_schema || [];

  console.log(schema);
  return (
    <PageFormGrid isVertical singleColumn>
      <PageFormTextInput name="name" label={t('Name')} isRequired />
      {schema.map((field) => (
        <SchemaField field={field} key={field.name} />
      ))}
    </PageFormGrid>
  );
}

function SchemaField(props: { field: PluginConfiguration }) {
  const { field } = props;

  if (['CharField', 'URLField', 'URLListField'].includes(field.type)) {
    return (
      <PageFormTextInput
        id={`schema-input-${field.name}`}
        name={`schema.${field.name}`}
        label={field.ui_field_label || field.name}
        isRequired={field.required}
        labelHelpTitle={field.ui_field_label || field.name}
        labelHelp={field.help_text}
      />
    );
  }

  if (field.type === 'BooleanField') {
    return (
      <PageFormSwitch
        id={`schema-switch-${field.name}`}
        name={`schema.${field.name}`}
        label={field.ui_field_label || field.name}
        labelHelpTitle={field.ui_field_label || field.name}
        labelHelp={field.help_text}
      />
    );
  }

  return null;
  if (field.type === 'JSONField') {
  }

  /*
  'JSONField'
  'BooleanField'
  'ListField'
  'LDAPConnectionOptions'
  'ChoiceField'
  'DictField'
  'LDAPSearchField'
  'DNField'
  'UserAttrMap'
  'PublicCert'
  'PrivateKey'
  */
}
