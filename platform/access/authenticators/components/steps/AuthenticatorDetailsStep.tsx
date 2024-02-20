import { useTranslation } from 'react-i18next';
import { TextContent, Text, TextVariants } from '@patternfly/react-core';
import {
  PageFormGrid,
  PageFormTextInput,
  PageFormSwitch,
  PageFormDataEditor,
} from '../../../../../framework';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { Authenticator } from '../../../../interfaces/Authenticator';
import {
  AuthenticatorPlugins,
  PluginConfiguration,
} from '../../../../interfaces/AuthenticatorPlugin';
import { AuthenticatorFormValues } from '../AuthenticatorForm';

/* TODO: more intelligent categorization of field type to input type
    pending updates to the API */
export const textInputTypes = [
  'CharField',
  'URLField',
  'URLListField',
  'ChoiceField',
  'DNField',
  'PublicCert',
  'PrivateKey',
];
export const dataInputTypes = [
  'JSONField',
  'DictField',
  'ListField',
  'LDAPConnectionOptions',
  'LDAPSearchField',
  'UserAttrMap',
];

export function AuthenticatorDetailsStep(props: {
  plugins: AuthenticatorPlugins;
  authenticator?: Authenticator;
}) {
  const { t } = useTranslation();
  const { wizardData } = usePageWizard();

  const authenticatorPlugin = props.plugins.authenticators.find((plugin) => {
    if (props.authenticator) {
      return plugin.type === props.authenticator.type;
    }
    return plugin.type === (wizardData as AuthenticatorFormValues).type;
  });
  const schema = authenticatorPlugin?.configuration_schema || [];
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
      {' '}
      <TextContent style={{ marginBottom: 25 }}>
        <Text component={TextVariants.h2}>{t('Authentication details')}</Text>
      </TextContent>
      <PageFormGrid isVertical>
        <PageFormTextInput name="name" label={t('Name')} isRequired />
        {textFields.map((field) => (
          <PageFormTextInput
            id={`configuration-input-${field.name}`}
            name={`configuration.${field.name}`}
            key={field.name}
            label={field.ui_field_label || field.name}
            isRequired={field.required}
            labelHelpTitle={field.ui_field_label || field.name}
            labelHelp={field.help_text}
          />
        ))}
        {boolFields.map((field) => (
          <PageFormSwitch
            id={`configuration-input-${field.name}`}
            name={`configuration.${field.name}`}
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
            id={`configuration-editor-${field.name}`}
            name={`configuration.${field.name}`}
            key={field.name}
            label={field.ui_field_label || field.name}
            labelHelpTitle={field.ui_field_label || field.name}
            labelHelp={field.help_text}
            isRequired={field.required}
          />
        ))}
      </PageFormGrid>
    </>
  );
}
