import { useTranslation } from 'react-i18next';
import { RemoteFormProps, SecretInput } from '../RemoteForm';
import { useIsValidUrl } from '../../../../common/validation/useIsValidUrl';
import { PageFormTextInput } from '../../../../../framework';
import { PageFormSecret } from '../../../../../framework/PageForm/Inputs/PageFormSecret';

export function ProxyAdvancedRemoteInputs({ onClear, shouldHideField }: SecretInput) {
  const { t } = useTranslation();
  const isValidUrl = useIsValidUrl();
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
          onClear && onClear('proxy_username');
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
          onClear && onClear('proxy_password');
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
