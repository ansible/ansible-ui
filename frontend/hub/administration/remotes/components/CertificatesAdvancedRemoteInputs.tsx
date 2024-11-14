import { PageFormCheckbox } from '@ansible/ansible-ui-framework';
import { PageFormFileUpload } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { PageFormSecret } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormSecret';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { HiddenFieldsType, RemoteFormProps } from '../RemoteForm';

export function CertificatesAdvancedRemoteInputs() {
  const { t } = useTranslation();
  const { resetField, getValues, setValue } = useFormContext();
  const [clear, setClear] = useState(false);

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
      <PageFormGroup
        label={t('TLS validation')}
        labelHelpTitle={t('TLS validation')}
        labelHelp={t('If selected, TLS peer validation must be performed.')}
      >
        <PageFormCheckbox<RemoteFormProps> name="tls_validation" />
      </PageFormGroup>
      <PageFormSecret
        onClear={() => {
          handleOnClear('client_key');
        }}
        shouldHideField={shouldHideField && shouldHideField('client_key')}
      >
        <PageFormFileUpload
          type="text"
          hideDefaultPreview
          label={t('Client key')}
          name="client_key"
          labelHelp={t('A PEM encoded private key used for authentication.')}
        />
      </PageFormSecret>
      <PageFormFileUpload
        type="text"
        hideDefaultPreview
        label={t('Client certificate')}
        name="client_cert"
        labelHelp={t('A PEM encoded client certificate used for authentication.')}
      />
      <PageFormFileUpload
        type="text"
        hideDefaultPreview
        label={t('CA certificate')}
        name="ca_cert"
        labelHelp={t('A PEM encoded client certificate used for authentication.')}
      />
    </>
  );
}
