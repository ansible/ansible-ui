import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { PageForm, PageFormTextInput, PageHeader, PageLayout } from '../../framework';
import { PageFormFileUpload } from '../../framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormSingleSelect } from '../../framework/PageForm/Inputs/PageFormSingleSelect';
import { PageFormSection } from '../../framework/PageForm/Utils/PageFormSection';
import { requestPut } from '../../frontend/common/crud/Data';
import { gatewayAPI } from '../api/gateway-api-utils';
import { GatewaySettingsOption } from './GatewaySettingOptions';
import { useGatewaySettingsCategories } from './GatewaySettingsCategories';

export function GatewaySettingsEdit(props: { categoryId?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings, options, refresh } = useOutletContext<{
    options: Record<string, GatewaySettingsOption>;
    settings: Record<string, unknown>;
    refresh: () => Promise<void>;
  }>();
  const categories = useGatewaySettingsCategories(options);
  const category = categories.find((category) => category.id === props.categoryId);
  if (!category) {
    return null;
  }
  return (
    <PageLayout>
      <PageHeader title={category.title} description={category.description} />
      <PageForm
        submitText={t('Save changes')}
        onSubmit={async (values) => {
          if ('custom_logo' in values && values.custom_logo instanceof File) {
            // get the extension of the file
            const ext = values.custom_logo.name.split('.').pop()?.toLowerCase();
            switch (ext) {
              case 'gif':
              case 'jpg':
              case 'jpeg':
              case 'png':
                {
                  values.custom_logo = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(values.custom_logo as Blob);
                  });
                }
                break;
            }
          }
          await requestPut(gatewayAPI`/settings/all/`, values);
          await refresh();
          navigate('..');
        }}
        defaultValue={settings}
      >
        {category.sections.map((section) => (
          <PageFormSection title={section.title} key={section.title}>
            {Object.keys(section.options).map((key) => {
              const option = options[key];
              switch (option.type) {
                case 'string':
                  return (
                    <PageFormTextInput
                      key={key}
                      name={key}
                      label={option.label}
                      labelHelp={option.help_text}
                      isRequired={option.required}
                      isReadOnly={option.read_only}
                      // helperText={key}
                    />
                  );
                case 'integer':
                  return (
                    <PageFormTextInput
                      type="number"
                      key={key}
                      name={key}
                      label={option.label}
                      labelHelp={option.help_text}
                      isRequired={option.required}
                      isReadOnly={option.read_only}
                      // helperText={key}
                    />
                  );
                case 'boolean':
                  return (
                    <PageFormSingleSelect
                      key={key}
                      name={key}
                      label={option.label}
                      placeholder={t('Disabled')}
                      labelHelp={option.help_text}
                      isRequired={option.required}
                      isReadOnly={option.read_only}
                      options={[
                        { label: t('Enabled'), value: 'true' },
                        { label: t('Disabled'), value: 'false' },
                      ]}
                      // helperText={key}
                    />
                  );
                case 'url':
                  return (
                    <PageFormTextInput
                      type="url"
                      key={key}
                      name={key}
                      label={option.label}
                      labelHelp={option.help_text}
                      isRequired={option.required}
                      isReadOnly={option.read_only}
                      // helperText={key}
                    />
                  );
                case 'field':
                  return (
                    <PageFormFileUpload
                      key={key}
                      name={key}
                      label={option.label}
                      labelHelp={option.help_text}
                      isRequired={option.required}
                      isReadOnly={option.read_only}
                      // helperText={key}
                    />
                  );
                default:
                  return <div>{t(`Unsupported settings type`)}</div>;
              }
            })}
          </PageFormSection>
        ))}
      </PageForm>
    </PageLayout>
  );
}
