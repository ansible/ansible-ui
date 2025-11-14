import { PageFormCheckbox, PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { PageFormSecret } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormSecret';
import { useIsValidUrl } from '@ansible/common-ui/validation/useIsValidUrl';
import { Alert } from '@patternfly/react-core';
import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RemoteFormProps } from '../RemoteForm';
import styled from 'styled-components';

const StyledAlert = styled(Alert)`
  padding-left: 1rem;
`;
interface IRemoteInputs {
  collection_signing?: boolean;
  disableEditName?: boolean;
  handleOnClear: (name: string) => void;
  isCommunityRemote?: boolean;
  setIsCommunityRemote?: (isCommunityRemote: boolean) => void;
  shouldHideField: (name: string) => boolean;
}

export function RemoteInputs({
  collection_signing,
  disableEditName,
  handleOnClear,
  isCommunityRemote,
  setIsCommunityRemote,
  shouldHideField,
}: Readonly<IRemoteInputs>) {
  const { t } = useTranslation();
  const isValidUrl = useIsValidUrl();
  const signedOnlyInput = useWatch({ name: 'signed_only' }) as boolean;
  const urlInput = useWatch({ name: 'url' }) as string;

  const parsedInputUrl = useMemo(() => {
    if (urlInput === '') {
      return '';
    }

    try {
      return new URL(urlInput);
    } catch {
      return '';
    }
  }, [urlInput]);

  useEffect(() => {
    if (parsedInputUrl) {
      setIsCommunityRemote &&
        setIsCommunityRemote(parsedInputUrl.hostname === 'galaxy.ansible.com');
    } else {
      setIsCommunityRemote && setIsCommunityRemote(false);
    }
  }, [parsedInputUrl, setIsCommunityRemote]);

  return (
    <>
      <PageFormTextInput<RemoteFormProps>
        name="name"
        label={t('Name')}
        placeholder={t('Enter remote name')}
        isRequired
        isDisabled={disableEditName}
      />
      <PageFormTextInput<RemoteFormProps>
        name="url"
        label={t('Server URL')}
        placeholder={t('Enter server URL')}
        labelHelp={t('The URL of an external content source.')}
        isRequired
        validate={isValidUrl}
      />
      <PageFormGroup label={t('Options')} fullWidth>
        {collection_signing ? (
          <>
            <PageFormCheckbox<RemoteFormProps>
              name="signed_only"
              label={t('Signed collections only')}
              labelHelp={t('Download only signed collections')}
            />
            {isCommunityRemote && signedOnlyInput ? (
              <Alert
                data-cy="signed-only-warning"
                isInline
                variant="warning"
                title={t`Community content will never be synced if this setting is enabled`}
              />
            ) : null}
          </>
        ) : null}

        <PageFormCheckbox<RemoteFormProps>
          name="sync_dependencies"
          label={t('Sync all dependencies')}
          labelHelpTitle={t('Sync all dependencies')}
          labelHelp={t('Include all dependencies when syncing a collection.')}
        />
        <StyledAlert
          data-cy="external-sync-warning"
          isInline
          isPlain
          variant="info"
          title={t`Syncing dependencies outside of repository may cause an issue in repository sync.`}
        />
      </PageFormGroup>

      <PageFormSecret
        onClear={() => {
          handleOnClear('username');
        }}
        shouldHideField={shouldHideField && shouldHideField('username')}
      >
        <PageFormTextInput<RemoteFormProps>
          name="username"
          label={t('Server username')}
          placeholder={t('Enter server username')}
          labelHelp={t(
            'The username to be used for authentication when syncing. This is not required when using a token.'
          )}
        />
      </PageFormSecret>
      <PageFormSecret
        onClear={() => {
          handleOnClear('password');
        }}
        shouldHideField={shouldHideField && shouldHideField('password')}
      >
        <PageFormTextInput<RemoteFormProps>
          type="password"
          name="password"
          label={t('Server password')}
          placeholder={t('Enter server password')}
          labelHelp={t(
            'The password to be used for authentication when syncing. This is not required when using a token.'
          )}
        />
      </PageFormSecret>

      <PageFormSecret
        onClear={() => {
          handleOnClear('token');
        }}
        shouldHideField={shouldHideField && shouldHideField('token')}
      >
        <PageFormTextInput<RemoteFormProps>
          name="token"
          type="password"
          label={t('Token')}
          placeholder={t('Enter token')}
          labelHelp={t('Token for authenticating to the server URL.')}
        />
      </PageFormSecret>
      <PageFormTextInput<RemoteFormProps>
        name="auth_url"
        label={t('SSO URL')}
        placeholder={t('Enter SSO URL')}
        labelHelp={t('Single sign on URL.')}
        validate={isValidUrl}
      />
    </>
  );
}
