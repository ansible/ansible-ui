import { PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { AwxPageForm } from '@ansible/awx-ui/common/AwxPageForm';
import { useAwxActiveUser } from '@ansible/awx-ui/common/useAwxActiveUser';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { Button, GridItem } from '@patternfly/react-core';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Account, LegacyAuth } from '../interfaces/LegacyAuth';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { useLegacyAuth } from './LegacyAuthProvider';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';

interface CreateAAPUserRequest {
  new_username: string | undefined;
  aap_password?: string;
}

interface CreateLDAPUserRequest {
  linked_accounts: Account[];
}

const CreateUserInputs = (props: { legacyAuth: LegacyAuth; isLDAPAccount: boolean }) => {
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const { legacyAuth, isLDAPAccount } = props;

  useEffect(() => {
    if (legacyAuth.needs_rename) {
      setValue('new_username', '');
    } else {
      setValue('new_username', legacyAuth.username);
    }
  }, [legacyAuth.needs_rename, legacyAuth.username, setValue]);

  return !isLDAPAccount ? (
    <PageFormSection singleColumn>
      {legacyAuth.allow_rename && (
        <GridItem span={8}>
          <PageFormTextInput<LegacyAuth>
            label={t('Username')}
            name="new_username"
            isRequired={legacyAuth.needs_rename}
          />
        </GridItem>
      )}
      {legacyAuth.allow_aap_password && (
        <GridItem span={8}>
          <PageFormTextInput<LegacyAuth>
            label={t('Password')}
            name="aap_password"
            type="password"
            isRequired={legacyAuth.needs_aap_password}
          />
        </GridItem>
      )}
    </PageFormSection>
  ) : null;
};

export function CreateAAPUserForm(props: {
  legacyAuth: LegacyAuth;
  setShowCreateUserForm: (value: boolean) => void;
  isLDAPAccount: boolean;
}) {
  const { t } = useTranslation();
  const { legacyAuth, setShowCreateUserForm, isLDAPAccount } = props;
  const { refreshActivePlatformUser } = usePlatformActiveUser();
  const { refreshLegacyAuth } = useLegacyAuth();
  const { refreshActiveAwxUser } = useAwxActiveUser();

  const cancelRequest = usePostRequest<{ username: string }>();
  const createAAPUserRequest = usePostRequest<
    CreateAAPUserRequest | CreateLDAPUserRequest,
    LegacyAuth
  >();

  const handleSubmit = async (formValues: LegacyAuth) => {
    await createAAPUserRequest(
      gatewayAPI`/legacy_auth/finalize/`,
      isLDAPAccount
        ? { linked_accounts: formValues.linked_accounts }
        : {
            new_username: formValues.new_username,
            aap_password: formValues.aap_password,
          }
    );
    refreshLegacyAuth?.();
    refreshActivePlatformUser?.();
    setShowCreateUserForm(false);
  };

  const handleBack = async () => {
    if (legacyAuth.is_migrated && legacyAuth.needs_aap_password) {
      try {
        await cancelRequest(gatewayAPI`/legacy_auth/reset/`, {
          username: legacyAuth?.username || '',
        });
      } finally {
        void refreshActiveAwxUser?.();
        void refreshActivePlatformUser?.();
        void refreshLegacyAuth?.();
      }
    } else {
      setShowCreateUserForm(false);
    }
  };

  return (
    <AwxPageForm<LegacyAuth>
      onSubmit={handleSubmit}
      submitText={t('Submit')}
      defaultValue={legacyAuth}
      disableGrid
      additionalActions={
        <Button variant="link" onClick={() => void handleBack()}>
          {t('Back')}
        </Button>
      }
    >
      <CreateUserInputs legacyAuth={legacyAuth} isLDAPAccount={isLDAPAccount} />
    </AwxPageForm>
  );
}
