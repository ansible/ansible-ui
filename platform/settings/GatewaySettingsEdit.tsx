import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@patternfly/react-core';
import {
  PageForm,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  usePageNavigate,
  PageFormSelect,
} from '../../framework';
import { PageFormFileUpload } from '../../framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormSection } from '../../framework/PageForm/Utils/PageFormSection';
import { requestPut } from '../../frontend/common/crud/Data';
import { gatewayAPI } from '../api/gateway-api-utils';
import { PlatformRoute } from '../main/PlatformRoutes';
import { GatewaySettingsOption } from './GatewaySettingOptions';
import { useGatewaySettingsCategories } from './GatewaySettingsCategories';
import { useRevertAllGatewaySettingsModal } from './useRevertAllGatewaySettingsModal';

export function GatewaySettingsEdit(props: { categoryId?: string }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const openRevertAllSettingsModal = useRevertAllGatewaySettingsModal();

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
          pageNavigate(PlatformRoute.GatewaySettings);
        }}
        onCancel={() => pageNavigate(PlatformRoute.GatewaySettings)}
        defaultValue={settings}
        additionalActions={
          <Button
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              openRevertAllSettingsModal({
                onComplete: () => pageNavigate(PlatformRoute.GatewaySettings),
              });
            }}
          >
            {t('Revert all to default')}
          </Button>
        }
      >
        {category.sections.map((section) => (
          <PageFormSection title={section.title} key={section.title}>
            {Object.keys(section.options).map((key) => {
              const option = options[key];
              /**
               * The if block below is needed because the Gateway token name field
               * should be disabled.  If a user edits it, the platform breaks.  From the api
               * this field has a read_only value of false, which makes the field active and
               * editable.  This should be fixed on the api side. Here is the issue
               * https://issues.redhat.com/browse/AAP-26871
               */
              if (key === 'gateway_token_name') {
                option.read_only = true;
              }
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
                      defaultValue={option.default}
                      enableUndo
                      enableReset
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
                      defaultValue={option.default}
                      enableUndo
                      enableReset
                    />
                  );
                case 'boolean':
                  return (
                    <PageFormSelect
                      key={key}
                      name={key}
                      label={option.label}
                      placeholderText={t('Disabled')}
                      labelHelp={option.help_text}
                      isRequired={option.required}
                      isReadOnly={option.read_only}
                      options={[
                        { label: t('Enabled'), value: true },
                        { label: t('Disabled'), value: false },
                      ]}
                      // helperText={key}
                      defaultValue={option.default}
                      enableReset
                      enableUndo
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
                      defaultValue={option.default}
                      enableUndo
                      enableReset
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
