import { Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormSelect,
  PageFormTextArea,
  PageFormTextInput,
} from '../../../../../framework';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormGroup } from '../../../../../framework/PageForm/Inputs/PageFormGroup';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { postRequest, requestPatch } from '../../../../../frontend/common/crud/Data';
import { gatewayAPI } from '../../../../api/gateway-api-utils';
import { Authenticator } from '../../../../interfaces/Authenticator';
import {
  AuthenticatorPlugin,
  AuthenticatorPlugins,
  PluginConfiguration,
} from '../../../../interfaces/AuthenticatorPlugin';
import { AuthenticatorFormValues, Configuration, formatConfiguration } from '../AuthenticatorForm';

/* TODO: more intelligent categorization of field type to input type
    pending updates to the API */
export const textInputTypes = [
  'CharField',
  'URLField',
  'URLListField',
  'ChoiceField',
  'DNField',
  'PublicCert',
];
export const dataInputTypes = [
  'JSONField',
  'DictField',
  'ListField',
  'LDAPConnectionOptions',
  'LDAPSearchField',
  'UserAttrMap',
];
export const textareaInputTypes = ['PrivateKey'];

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
  let schema = authenticatorPlugin?.configuration_schema || [];
  const textFields: PluginConfiguration[] = [];
  const textareaFields: PluginConfiguration[] = [];
  const boolFields: PluginConfiguration[] = [];
  const dataFields: PluginConfiguration[] = [];

  const type = authenticatorPlugin?.type || '';
  if (!props.authenticator && (type.includes('github') || type.includes('azuread'))) {
    // Omit Github/Azuread callback URL field on create
    // This allows the API to automatically generate one
    schema = schema.filter((s) => s.name !== 'CALLBACK_URL');
  }

  schema.forEach((field) => {
    if (textInputTypes.includes(field.type)) {
      textFields.push(field);
    } else if (field.type === 'BooleanField') {
      boolFields.push(field);
    } else if (dataInputTypes.includes(field.type)) {
      dataFields.push(field);
    } else if (textareaInputTypes.includes(field.type)) {
      textareaFields.push(field);
    }
  });

  return (
    <>
      <TextContent>
        <Text component={TextVariants.h2}>{t('Authentication details')}</Text>
      </TextContent>
      <PageFormSection>
        <PageFormTextInput name="name" label={t('Name')} isRequired placeholder={t('Enter name')} />
        {textFields.map((field) =>
          field.type === 'ChoiceField' ? (
            <PageFormSelect
              id={`configuration-input-${field.name}`}
              name={`configuration.${field.name}`}
              key={field.name}
              label={field.ui_field_label || field.name}
              labelHelpTitle={field.ui_field_label || field.name}
              labelHelp={field.help_text}
              options={Object.keys(field.choices || {}).map((option) => ({
                value: option,
                label: (field.choices as { [k: string]: string })[option] || option,
              }))}
              placeholderText={t('Select a value')}
              isRequired={field.required}
            />
          ) : (
            <PageFormTextInput
              id={`configuration-input-${field.name}`}
              name={`configuration.${field.name}`}
              key={field.name}
              label={field.ui_field_label || field.name}
              labelHelpTitle={field.ui_field_label || field.name}
              labelHelp={field.help_text}
              isRequired={field.required}
              placeholder={t(`Enter ${field.ui_field_label || field.name}`)}
            />
          )
        )}
        {textareaFields.length > 0 && (
          <PageFormSection singleColumn>
            {textareaFields.map((field) => (
              <PageFormTextArea
                id={`configuration-textarea-${field.name}`}
                name={`configuration.${field.name}`}
                key={field.name}
                label={field.ui_field_label || field.name}
                labelHelpTitle={field.ui_field_label || field.name}
                labelHelp={field.help_text}
                isRequired={field.required}
                placeholder={`Enter ${field.ui_field_label || field.name}`}
              />
            ))}
          </PageFormSection>
        )}
        {boolFields.length > 0 && (
          <PageFormSection singleColumn>
            {boolFields.map((field) => (
              <PageFormCheckbox
                id={`configuration-input-${field.name}`}
                name={`configuration.${field.name}`}
                key={field.name}
                label={field.ui_field_label || field.name}
                isRequired={field.required}
                labelHelpTitle={field.ui_field_label || field.name}
                labelHelp={field.help_text}
              />
            ))}
          </PageFormSection>
        )}
      </PageFormSection>
      <PageFormSection singleColumn>
        {dataFields.map((field) => {
          const fieldType = schema.find((fieldDef) => fieldDef.name === field.name)?.type;
          return (
            <PageFormDataEditor
              id={`configuration-editor-${field.name}`}
              name={`configuration.${field.name}`}
              key={field.name}
              label={field.ui_field_label || field.name}
              labelHelpTitle={field.ui_field_label || field.name}
              labelHelp={field.help_text}
              isRequired={field.required}
              format="json"
              isArray={!!fieldType && ['ListField', 'LDAPSearchField'].includes(fieldType)}
            />
          );
        })}
      </PageFormSection>
      <PageFormSection>
        <PageFormGroup label={t('Options')}>
          <PageFormCheckbox
            name="enabled"
            label={t('Enabled')}
            labelHelp={t(' Should this authenticator be enabled')}
          />
          <PageFormCheckbox
            name="create_objects"
            label={t('Create objects')}
            labelHelp={t('Allow authenticator to create objects (users, teams, organizations)')}
          />
          <PageFormCheckbox
            name="remove_users"
            label={t('Remove users')}
            labelHelp={t(
              'When a user authenticates from this source should they be removed from any other groups they were previously added to'
            )}
          />
        </PageFormGroup>
      </PageFormSection>
    </>
  );
}

export async function validateDetailsStep(
  formData: { name: string; configuration: Configuration },
  wizardData: AuthenticatorFormValues,
  plugins: AuthenticatorPlugins,
  authenticator?: Authenticator
) {
  const isEditMode = !!authenticator;
  const type = isEditMode ? authenticator.type : wizardData.type;
  const plugin = plugins.authenticators.find((plugin) => plugin.type === type);
  const request = isEditMode ? requestPatch : postRequest;
  const url = isEditMode
    ? gatewayAPI`/authenticators/${authenticator.id.toString()}/?validate=True`
    : gatewayAPI`/authenticators/?validate=True`;

  try {
    await request(url, {
      name: formData.name,
      type,
      configuration: formatConfiguration(formData.configuration, plugin as AuthenticatorPlugin),
    });
  } catch (error) {
    (error as { configurationSchema?: PluginConfiguration[] }).configurationSchema =
      plugin?.configuration_schema;
    throw error;
  }
}
