import { useTranslation } from 'react-i18next';
import { useIsValidUrl } from '../../../../common/validation/useIsValidUrl';
import { useWatch } from 'react-hook-form';
import { RemoteFormProps, SecretInput } from '../RemoteForm';
import { PageFormCheckbox, PageFormTextInput } from '../../../../../framework';
import { PageFormGroup } from '../../../../../framework/PageForm/Inputs/PageFormGroup';
import { Alert } from '@patternfly/react-core';
import { PageFormSecret } from '../../../../../framework/PageForm/Inputs/PageFormSecret';

interface IRemoteInputs extends SecretInput {
  isCommunityRemote?: boolean;
  collection_signing?: boolean;
  disableEditName?: boolean;
}
export function RemoteInputs({
  disableEditName,
  collection_signing,
  isCommunityRemote,
  onClear,
  shouldHideField,
}: IRemoteInputs) {
  const { t } = useTranslation();
  const isValidUrl = useIsValidUrl();
  const signedOnlyInput = useWatch({ name: 'signed_only' }) as boolean;

  return (
    <>
      <PageFormTextInput<RemoteFormProps>
        name="name"
        label={t('Name')}
        placeholder={t('Enter a remote name')}
        isRequired
        isDisabled={disableEditName}
      />
      <PageFormTextInput<RemoteFormProps>
        name="url"
        label={t('URL')}
        placeholder={t('Enter a URL')}
        labelHelp={t('The URL of an external content source.')}
        isRequired
        validate={isValidUrl}
      />
      {collection_signing ? (
        <PageFormGroup
          label={t('Signed collections only')}
          labelHelp={t('Download only signed collections')}
        >
          <>
            <PageFormCheckbox<RemoteFormProps> name="signed_only" />
            {isCommunityRemote && signedOnlyInput ? (
              <Alert
                data-cy="signed-only-warning"
                isInline
                variant="warning"
                title={t`Community content will never be synced if this setting is enabled`}
              />
            ) : null}
          </>
        </PageFormGroup>
      ) : null}
      <PageFormGroup
        label={t('Sync all dependencies')}
        labelHelpTitle={t('Sync all dependencies')}
        labelHelp={t('Include all dependencies when syncing a collection.')}
      >
        <PageFormCheckbox<RemoteFormProps> name="sync_dependencies" />
      </PageFormGroup>
      <PageFormSecret
        onClear={() => {
          onClear && onClear('username');
        }}
        shouldHideField={shouldHideField && shouldHideField('username')}
      >
        <PageFormTextInput<RemoteFormProps>
          name="username"
          label={t('Username')}
          placeholder={t('Enter a username')}
          labelHelp={t(
            'The username to be used for authentication when syncing. This is not required when using a token.'
          )}
        />
      </PageFormSecret>
      <PageFormSecret
        onClear={() => {
          onClear && onClear('password');
        }}
        shouldHideField={shouldHideField && shouldHideField('password')}
      >
        <PageFormTextInput<RemoteFormProps>
          type="password"
          name="password"
          label={t('Password')}
          placeholder={t('Enter a password')}
          labelHelp={t(
            'The password to be used for authentication when syncing. This is not required when using a token.'
          )}
        />
      </PageFormSecret>

      <PageFormSecret
        onClear={() => {
          onClear && onClear('token');
        }}
        shouldHideField={shouldHideField && shouldHideField('token')}
      >
        <PageFormTextInput<RemoteFormProps>
          name="token"
          type="password"
          label={t('Token')}
          placeholder={t('Enter a token')}
          labelHelp={t('Token for authenticating to the server URL.')}
        />
      </PageFormSecret>
      <PageFormTextInput<RemoteFormProps>
        name="auth_url"
        label={t('SSO URL')}
        placeholder={t('Enter a SSO URL')}
        labelHelp={t('Single sign on URL.')}
        validate={isValidUrl}
      />
    </>
  );
}
