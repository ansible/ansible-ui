import {
  PageForm,
  PageFormSelect,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormFileUpload } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { requestPut } from '@ansible/common-ui/crud/Data';
import { useIsValidUrl } from '@ansible/common-ui/validation/useIsValidUrl';
import {
  Button,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
} from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useEffect } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { PlatformRoute } from '../main/PlatformRoutes';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { GatewaySettingsOption, UrlOption } from './GatewaySettingOptions';
import { useGatewaySettingsCategories } from './GatewaySettingsCategories';
import { useRevertAllGatewaySettingsModal } from './useRevertAllGatewaySettingsModal';

export function GatewaySettingsEdit(props: { categoryId?: string }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const openRevertAllSettingsModal = useRevertAllGatewaySettingsModal();

  const { settings, options, refresh } = useOutletContext<{
    options: {
      GET: Record<string, GatewaySettingsOption>;
      PUT: Record<string, GatewaySettingsOption>;
    };
    settings: Record<string, unknown>;
    refresh: () => Promise<void>;
  }>();

  const categories = useGatewaySettingsCategories(options.PUT);
  const category = categories.find((category) => category.id === props.categoryId);

  if (!category) {
    return null;
  }

  const handleSubmit = async (values: Record<string, unknown>) => {
    const { CONFIRM_LOGIN_REDIRECT_OVERRIDE, CSRF_TRUSTED_ORIGINS, ...submitValues } = values;

    // Process CSRF_TRUSTED_ORIGINS array
    const processedCSRF = Array.isArray(CSRF_TRUSTED_ORIGINS)
      ? CSRF_TRUSTED_ORIGINS.filter((url: string) => url && url.trim() !== '').map((url: string) =>
          url.trim()
        )
      : [];

    // Handle custom logo file upload
    if ('custom_logo' in submitValues && submitValues.custom_logo instanceof File) {
      const ext = submitValues.custom_logo.name.split('.').pop()?.toLowerCase();
      if (['gif', 'jpg', 'jpeg', 'png'].includes(ext || '')) {
        submitValues.custom_logo = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(values.custom_logo as Blob);
        });
      }
    }

    await requestPut(gatewayAPI`/settings/all/`, {
      ...submitValues,
      CSRF_TRUSTED_ORIGINS: processedCSRF,
    });
    await refresh();
    pageNavigate(PlatformRoute.GatewaySettings);
  };

  return (
    <PageLayout>
      <PageHeader title={category.title} description={category.description} />
      <PageForm
        submitText={t('Save platform gateway settings')}
        onSubmit={handleSubmit}
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
              const option = options.PUT[key];
              // Gateway token name should be read-only
              if (key === 'gateway_token_name') {
                option.read_only = true;
              }
              if (key === 'LOGIN_REDIRECT_OVERRIDE' && option.type === 'url') {
                return <LoginRedirectOverrideInputs key={key} name={key} option={option} />;
              }

              if (key === 'CSRF_TRUSTED_ORIGINS') {
                return <CSRFTrustedOriginsInputs key={key} name={key} />;
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
                    />
                  );
                default:
                  return <div key={key}>{t('Unsupported settings type')}</div>;
              }
            })}
          </PageFormSection>
        ))}
      </PageForm>
    </PageLayout>
  );
}

export function LoginRedirectOverrideInputs(props: {
  readonly option: UrlOption;
  readonly name: string;
}) {
  const { name, option } = props;
  const { t } = useTranslation();
  const LOGINREDIRECT = useWatch<Record<string, string>, 'LOGIN_REDIRECT_OVERRIDE'>({
    name: 'LOGIN_REDIRECT_OVERRIDE',
  });
  const CONFIRMLOGINREDIRECT = useWatch<Record<string, string>, 'CONFIRM_LOGIN_REDIRECT_OVERRIDE'>({
    name: 'CONFIRM_LOGIN_REDIRECT_OVERRIDE',
    defaultValue: option.default,
  });

  return (
    <>
      <PageFormTextInput
        type="url"
        key={name}
        name={name}
        label={option.label}
        labelHelp={option.help_text}
        isRequired={option.required}
        isReadOnly={option.read_only}
        defaultValue={option.default}
        enableUndo
        enableReset
      />
      <PageFormTextInput
        validate={() =>
          LOGINREDIRECT === CONFIRMLOGINREDIRECT
            ? undefined
            : t('This field must match login redirect override.')
        }
        type="url"
        key={'CONFIRM_LOGIN_REDIRECT_OVERRIDE'}
        name={'CONFIRM_LOGIN_REDIRECT_OVERRIDE'}
        label={t('Confirm login redirect override')}
        labelHelp={t('This value must match the value in login redirect override.')}
        isRequired={LOGINREDIRECT.length > 0}
        defaultValue={LOGINREDIRECT}
      />
    </>
  );
}

export function CSRFTrustedOriginsInputs({ name }: { name: string }) {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const isValidUrl = useIsValidUrl();

  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  // Initialize with at least one empty field if none exist (run only once on mount)
  useEffect(() => {
    if (fields.length === 0) {
      append('');
    }
  }, [append, fields.length]); // Empty dependency array = runs only once on mount
  const validate = (url: string) => {
    /**If there is not string in the input it is valid.  This is an optional field. */
    if (!url.trim().length) return true;
    /**
     * The API expects a url formatted like https://www.example.com, not https://www.example.com/
     * The difference is the trailing slash, and anything that might come after it is not allowed.
     */
    try {
      const parsed = new URL(url);
      if (url.endsWith(`${parsed.pathname}`)) {
        return t(`Trusted origins must be http protocol and host name only: ${url}`);
      }
      return isValidUrl(url);
    } catch (error) {
      // Handle URL parsing errors - check for specific error types
      if (error instanceof TypeError) {
        return t('Invalid URL format - please check the URL syntax');
      }
      return t('Invalid URL');
    }
  };
  return (
    <PageFormSection title={t('CSRF trusted origins list')} singleColumn>
      {fields.map((field, index) => (
        <div key={field.id} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flexGrow: 1 }}>
            <Controller
              name={`${name}.${index}`}
              rules={{ validate: validate }}
              control={control}
              render={({ field: { ...rest }, fieldState: { error } }) => {
                return (
                  <>
                    <TextInput
                      id={`link-url-${index}`}
                      data-cy={`link-url-${index}`}
                      {...rest}
                      type="url"
                      placeholder={t('Enter trusted origin URL')}
                    />
                    {error ? (
                      <FormHelperText>
                        <HelperText>
                          <HelperTextItem variant="error">{error?.message}</HelperTextItem>
                        </HelperText>
                      </FormHelperText>
                    ) : null}
                  </>
                );
              }}
            />
          </div>
          <Button
            icon={<PlusCircleIcon />}
            type="button"
            variant="plain"
            data-cy={`add-trusted-origin-${index}`}
            aria-label={t('Add CSRF trusted origin')}
            onClick={() => append('')}
          />
          <Button
            icon={<TrashIcon />}
            type="button"
            variant="plain"
            data-cy={`remove-trusted-origin-${index}`}
            isDisabled={fields.length < 2}
            aria-label={t('Remove trusted origin')}
            onClick={() => remove(index)}
          />
        </div>
      ))}
    </PageFormSection>
  );
}
