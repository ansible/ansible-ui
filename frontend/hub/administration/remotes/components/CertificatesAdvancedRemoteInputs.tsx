import { PageFormCheckbox } from '@ansible/ansible-ui-framework';
import { PageFormFileUpload } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { PageFormSecret } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormSecret';
import { useTranslation } from 'react-i18next';
import { RemoteFormProps } from '../RemoteForm';

interface Props {
  handleOnClear: (name: string) => void;
  shouldHideField: (name: string) => boolean;
}

export function CertificatesAdvancedRemoteInputs({
  shouldHideField,
  handleOnClear,
}: Readonly<Props>) {
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
