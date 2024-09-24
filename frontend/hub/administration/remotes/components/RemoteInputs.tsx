import { useTranslation } from 'react-i18next';
import { useIsValidUrl } from '../../../../common/validation/useIsValidUrl';
import { useWatch, useFormContext, useForm } from 'react-hook-form';
import { HiddenFieldsType, RemoteFormProps } from '../RemoteForm';
import { PageFormCheckbox, PageFormTextInput } from '../../../../../framework';
import { PageFormGroup } from '../../../../../framework/PageForm/Inputs/PageFormGroup';
import { Alert } from '@patternfly/react-core';
import { PageFormSecret } from '../../../../../framework/PageForm/Inputs/PageFormSecret';
import { useEffect, useMemo, useState } from 'react';
import { REMOTE_COMMUNITY_COLLECTIONS_URL } from '../constants';

interface IRemoteInputs {
  isCommunityRemote?: boolean;
  setIsCommunityRemote?: (isCommunityRemote: boolean) => void;
  collection_signing?: boolean;
  disableEditName?: boolean;
}
export function RemoteInputs({
  disableEditName,
  collection_signing,
  isCommunityRemote,
  setIsCommunityRemote,
}: IRemoteInputs) {
  const { t } = useTranslation();
  const isValidUrl = useIsValidUrl();
  const [clear, setClear] = useState(false);
  const signedOnlyInput = useWatch({ name: 'signed_only' }) as boolean;
  const urlInput = useWatch({ name: 'url' }) as string;
  const { getValues, setValue } = useFormContext();
  const { resetField } = useForm();

  const parsedInputUrl = useMemo(() => {
    if (urlInput === '') return '';
    try {
      return new URL(urlInput);
    } catch {
      return '';
    }
  }, [urlInput]);

  useEffect(() => {
    if (parsedInputUrl) {
      const parsedCommunityCollectionsUrl = new URL(REMOTE_COMMUNITY_COLLECTIONS_URL);
      const isCommunityHostName =
        parsedInputUrl.hostname === parsedCommunityCollectionsUrl.hostname;
      setIsCommunityRemote && setIsCommunityRemote(isCommunityHostName);
    } else {
      setIsCommunityRemote && setIsCommunityRemote(false);
    }
  }, [parsedInputUrl, setIsCommunityRemote]);

  const handleOnClear = (name: string) => {
    resetField(name, { defaultValue: null });
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
