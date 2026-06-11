import { PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormSecret } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormSecret';
import { useIsValidUrl } from '@ansible/common-ui/validation/useIsValidUrl';
import { useTranslation } from 'react-i18next';
import { RemoteFormProps } from '../RemoteForm';

interface Props {
  handleOnClear: (name: string) => void;
  shouldHideField: (name: string) => boolean;
}

export function ProxyAdvancedRemoteInputs({ shouldHideField, handleOnClear }: Readonly<Props>) {
  const { t } = useTranslation();
  const isValidUrl = useIsValidUrl();

  return (
    <>
      <PageFormTextInput<RemoteFormProps>
        name="proxy_url"
        label={t('Proxy URL')}
        placeholder={t('Enter proxy URL')}
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
          placeholder={t('Enter proxy username')}
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
          placeholder={t('Enter proxy password')}
        />
      </PageFormSecret>
    </>
  );
}
