import { useTranslation } from 'react-i18next';
import { HiddenFieldsType, RemoteFormProps } from '../RemoteForm';
import { useIsValidUrl } from '../../../../common/validation/useIsValidUrl';
import { PageFormTextInput } from '../../../../../framework';
import { PageFormSecret } from '../../../../../framework/PageForm/Inputs/PageFormSecret';
import { useFormContext } from 'react-hook-form';
import { useState } from 'react';

export function ProxyAdvancedRemoteInputs() {
  const { t } = useTranslation();
  const isValidUrl = useIsValidUrl();
  const [clear, setClear] = useState(false);
  const { resetField, getValues, setValue } = useFormContext();

  const handleOnClear = (name: string) => {
    resetField(name);
    setClear(!clear);
    const hiddenFields = getValues('hidden_fields') as HiddenFieldsType;

    if (!hiddenFields) return;
    const index = hiddenFields.findIndex((field) => field.name === name);
    if (index !== undefined && index > -1) {
      hiddenFields[index].is_set = false;
      setValue('hidden_fields', hiddenFields);
    }
  };

  const shouldHideField = (name: string) => {
    const hiddenFields = getValues('hidden_fields') as HiddenFieldsType;
    if (!hiddenFields) {
      return false;
    }
    return !!hiddenFields.find((field) => field.name === name)?.is_set;
  };
  return (
    <>
      <PageFormTextInput<RemoteFormProps>
        name="proxy_url"
        label={t('Proxy URL')}
        placeholder={t('Enter a proxy URL')}
        labelHelp={t('The URL of an external proxy server.')}
        validate={isValidUrl}
      />
      <PageFormSecret
        onClear={() => {
          handleOnClear('proxy_username');
        }}
        shouldHideField={shouldHideField && shouldHideField('proxy_username')}
      >
        <PageFormTextInput<RemoteFormProps>
          name="proxy_username"
          label={t('Proxy username')}
          placeholder={t('Enter a proxy username')}
        />
      </PageFormSecret>
      <PageFormSecret
        onClear={() => {
          handleOnClear('proxy_password');
        }}
        shouldHideField={shouldHideField && shouldHideField('proxy_password')}
      >
        <PageFormTextInput<RemoteFormProps>
          type="password"
          name="proxy_password"
          label={t('Proxy password')}
          placeholder={t('Enter a proxy password')}
        />
      </PageFormSecret>
    </>
  );
}
