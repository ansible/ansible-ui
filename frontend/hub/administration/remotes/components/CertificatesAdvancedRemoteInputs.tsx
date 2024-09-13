import { useTranslation } from 'react-i18next';
import { RemoteFormProps, SecretInput } from '../RemoteForm';
import { PageFormGroup } from '../../../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormCheckbox } from '../../../../../framework';
import { PageFormSecret } from '../../../../../framework/PageForm/Inputs/PageFormSecret';
import { PageFormFileUpload } from '../../../../../framework/PageForm/Inputs/PageFormFileUpload';

export function CertificatesAdvancedRemoteInputs({ onClear, shouldHideField }: SecretInput) {
  const { t } = useTranslation();
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
          onClear && onClear('client_key');
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
